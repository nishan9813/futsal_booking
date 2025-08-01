from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Booking
from .serializers import BookingSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from ownerAPI.models import Ground


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-booking_date', '-created_at')

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except DjangoValidationError as e:
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
@permission_classes([IsAuthenticated])
def booked_time_slots(request):
    ground_id = request.query_params.get('ground')
    date = request.query_params.get('date')

    if not ground_id or not date:
        return Response({"error": "Both ground and date are required."}, status=400)

    bookings = Booking.objects.filter(ground_id=ground_id, booking_date=date)
    booked_slots = bookings.values_list('time_slot', flat=True)

    return Response(list(booked_slots))
