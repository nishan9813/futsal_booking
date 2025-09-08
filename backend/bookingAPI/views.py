from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from .models import Booking
from .serializers import BookingSerializer
from ownerAPI.models import Ground
from ownerAPI.models import OwnerProfile


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return bookings only for the logged-in user
        return Booking.objects.filter(user=self.request.user).order_by('-booking_date', '-created_at')

    def perform_create(self, serializer):
        try:
            # Ensure the user is assigned explicitly, even though serializer HiddenField does it,
            # this is a good safety measure
            serializer.save(user=self.request.user)
        except DjangoValidationError as e:
            # Convert Django ValidationError to DRF ValidationError for proper API error response
            raise DRFValidationError(e.message_dict)


class GroundTimeSlotsView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Ground.objects.all()

    def retrieve(self, request, *args, **kwargs):
        ground = self.get_object()  # fetches by pk (ground_id)
        return Response(ground.available_time_slots)


class BookedTimeSlotsView(generics.ListAPIView):
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        ground_id = request.query_params.get('ground')
        date = request.query_params.get('date')

        if not ground_id or not date:
            return Response({"error": "Both ground and date are required."}, status=400)

        bookings = Booking.objects.filter(ground_id=ground_id, booking_date=date)
        booked_slots = bookings.values_list('time_slot', flat=True)
        return Response(list(booked_slots))


class UserBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only the bookings of the logged-in user
        return Booking.objects.filter(
            user=self.request.user
        ).order_by("-booking_date", "-time_slot")



class OwnerBookingHistoryView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'owner_profile'):
            owner = self.request.user.owner_profile
            grounds = owner.grounds.all()
            qs = Booking.objects.filter(ground__in=grounds)

            date = self.request.query_params.get('date')
            if date:
                qs = qs.filter(booking_date=date)

            return qs.order_by('booking_date', 'time_slot')
        return Booking.objects.none()  # empty queryset





class CancelBookingView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def update(self, request, *args, **kwargs):
        if not hasattr(request.user, 'owner_profile'):
            return Response({'detail': 'Not an owner'}, status=403)

        try:
            booking = Booking.objects.get(id=kwargs['id'], ground__owner=request.user.owner_profile)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=404)

        booking.status = 'cancelled'
        booking.save()
        return Response({'message': 'Booking cancelled successfully'})




class GroundsByOwnerView(generics.ListAPIView):
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        owner_id = kwargs['owner_id']
        try:
            owner = OwnerProfile.objects.get(id=owner_id)
            grounds = owner.grounds.all()
            data = [
                {
                    'id': g.id,
                    'name': g.name,
                    'ground_type': g.ground_type,
                    'available_time_slots': g.available_time_slots
                }
                for g in grounds
            ]
            return Response({'grounds': data})
        except OwnerProfile.DoesNotExist:
            return Response({'error': 'Owner not found'}, status=404)
