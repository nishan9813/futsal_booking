from rest_framework import viewsets, permissions, status
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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ground_time_slots(request, ground_id):
    try:
        ground = Ground.objects.get(id=ground_id)
        return Response(ground.available_time_slots)
    except Ground.DoesNotExist:
        return Response({"error": "Ground not found"}, status=404)


@api_view(["GET"])
@permission_classes([AllowAny])
def booked_time_slots(request):
    ground_id = request.query_params.get('ground')
    date = request.query_params.get('date')

    if not ground_id or not date:
        return Response({"error": "Both ground and date are required."}, status=400)

    bookings = Booking.objects.filter(ground_id=ground_id, booking_date=date)
    booked_slots = bookings.values_list('time_slot', flat=True)

    return Response(list(booked_slots))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_booking_history(request):
    bookings = Booking.objects.filter(user=request.user).order_by('-booking_date')
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_booking_history(request):
    if hasattr(request.user, 'owner_profile'):
        owner = request.user.owner_profile
        grounds = owner.grounds.all()

        bookings = Booking.objects.filter(ground__in=grounds)

        date = request.query_params.get('date')
        if date:
            bookings = bookings.filter(booking_date=date)

        bookings = bookings.order_by('booking_date', 'time_slot')

        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    return Response({'detail': 'Not an owner'}, status=403)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    if not hasattr(request.user, 'owner_profile'):
        return Response({'detail': 'Not an owner'}, status=403)

    try:
        booking = Booking.objects.get(id=booking_id, ground__owner=request.user.owner_profile)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=404)

    booking.status = 'cancelled'
    booking.save()
    return Response({'message': 'Booking cancelled successfully'})



@api_view(['GET'])
@permission_classes([AllowAny])
def grounds_by_owner(request, owner_id):
    """
    Fetch all grounds for a given owner ID
    """
    try:
        owner = OwnerProfile.objects.get(id=owner_id)
        grounds = owner.grounds.all()  # assuming related_name='grounds' in Owner model
        grounds_data = [
            {
                'id': g.id,
                'name': g.name,
                'ground_type': g.ground_type,
                'available_time_slots': g.available_time_slots
            }
            for g in grounds
        ]
        return Response({'grounds': grounds_data})
    except OwnerProfile.DoesNotExist:
        return Response({'error': 'Owner not found'}, status=404)