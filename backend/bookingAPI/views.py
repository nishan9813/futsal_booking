# bookingAPI/views.py
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
from django.utils import timezone
from datetime import timedelta, datetime
import uuid
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from .models import Booking, Payment, DemoPaymentAccount, BookingCancellationService
from .serializers import (
    BookingSerializer, 
    BookingDetailSerializer, 
    BookingCancellationSerializer,
    CancelBookingRequestSerializer,
    CancellationResponseSerializer
)
from ownerAPI.models import Ground, OwnerProfile
from ownerAPI.utils.dynamicPricing import calculate_dynamic_price

# ---------------------------------------------------------------------
# Booking CRUD (for normal users)
# ---------------------------------------------------------------------
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('ground', 'user', 'ground__owner').order_by('-booking_date', '-time_slot')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BookingDetailSerializer
        elif self.action == 'cancel_booking':
            return CancelBookingRequestSerializer
        elif self.action == 'cancellation_info':
            return BookingCancellationSerializer
        return BookingSerializer

    # @action(detail=True, methods=['post'])
    # def cancel_booking(self, request, pk=None):
    #     """Cancel a booking with refund policy using utility service"""
    #     booking = self.get_object()
        
    #     # Check if user owns the booking
    #     if booking.user != request.user:
    #         return Response({
    #             'success': False,
    #             'error': 'You do not have permission to cancel this booking.'
    #         }, status=status.HTTP_403_FORBIDDEN)
        
    #     # Validate cancellation request
    #     serializer = CancelBookingRequestSerializer(data=request.data)
    #     if not serializer.is_valid():
    #         return Response({
    #             'success': False,
    #             'error': serializer.errors
    #         }, status=status.HTTP_400_BAD_REQUEST)
        
    #     try:
    #         # Use the cancellation service to process cancellation
    #         success, message, refund_amount, updated_booking = BookingCancellationService.process_cancellation(booking)
            
    #         if success:
    #             # Serialize the response
    #             response_serializer = CancellationResponseSerializer({
    #                 'success': True,
    #                 'message': message,
    #                 'refund_amount': refund_amount,
    #                 'refund_eligible': updated_booking.is_refund_eligible,
    #                 'cancellation_time': updated_booking.cancelled_at,
    #                 'booking': updated_booking
    #             })
    #             return Response(response_serializer.data, status=status.HTTP_200_OK)
    #         else:
    #             return Response({
    #                 'success': False,
    #                 'error': message
    #             }, status=status.HTTP_400_BAD_REQUEST)
            
    #     except Exception as e:
    #         return Response({
    #             'success': False,
    #             'error': 'An unexpected error occurred while cancelling the booking.'
    #         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def cancel_booking(self, request, pk=None):
        """Cancel a booking with refund policy using utility service"""
        booking = self.get_object()
        
        # Check if user owns the booking
        if booking.user != request.user:
            return Response({
                'success': False,
                'error': 'You do not have permission to cancel this booking.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Validate cancellation request
        serializer = CancelBookingRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            print(f"=== DEBUG: Starting cancellation for booking {booking.id} ===")
            
            # Use the cancellation service to process cancellation
            success, message, refund_amount, updated_booking = BookingCancellationService.process_cancellation(booking)
            
            print(f"=== DEBUG: Cancellation result - success: {success}, message: {message}, refund: {refund_amount} ===")
            
            if success:
                # Serialize the response
                response_serializer = CancellationResponseSerializer({
                    'success': True,
                    'message': message,
                    'refund_amount': refund_amount,
                    'refund_eligible': updated_booking.is_refund_eligible,
                    'cancellation_time': updated_booking.cancelled_at,
                    'booking': updated_booking
                })
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': message
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"=== DEBUG: Exception in cancel_booking: {str(e)} ===")
            import traceback
            print(f"=== DEBUG: Traceback: {traceback.format_exc()} ===")
            
            return Response({
                'success': False,
                'error': f'An unexpected error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def cancellation_info(self, request, pk=None):
        """Get cancellation information for a booking using utility service"""
        booking = self.get_object()
        
        # Check if user owns the booking
        if booking.user != request.user:
            return Response({
                'error': 'You do not have permission to view this booking.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get cancellation info from service
        cancellation_info = BookingCancellationService.get_cancellation_info(booking)
        return Response(cancellation_info)

# ---------------------------------------------------------------------
# Ground related views
# ---------------------------------------------------------------------
class GroundTimeSlotsView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Ground.objects.all()

    def retrieve(self, request, *args, **kwargs):
        ground = self.get_object()
        return Response(ground.available_time_slots)


class BookedTimeSlotsView(generics.ListAPIView):
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        ground_id = request.query_params.get('ground')
        date = request.query_params.get('date')

        if not ground_id or not date:
            return Response({"error": "Both ground and date are required."}, status=400)

        bookings = Booking.objects.filter(ground_id=ground_id, booking_date=date, status='booked')
        booked_slots = bookings.values_list('time_slot', flat=True)
        return Response(list(booked_slots))


# ---------------------------------------------------------------------
# Dynamic/Base Price Endpoint
# ---------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def get_ground_price(request):
    ground_id = request.query_params.get("ground_id")
    dt_str = request.query_params.get("datetime")

    if not ground_id or not dt_str:
        return Response({"error": "ground_id and datetime are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        ground = Ground.objects.get(id=ground_id)
    except Ground.DoesNotExist:
        return Response({"error": "Ground not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        booking_datetime = datetime.fromisoformat(dt_str)
    except ValueError:
        return Response({"error": "Invalid datetime format. Use ISO format e.g. 2025-10-19T18:00"}, status=status.HTTP_400_BAD_REQUEST)

    recent_booking_count = Booking.objects.filter(ground=ground, booking_date=booking_datetime.date()).count()
    price = calculate_dynamic_price(ground, booking_datetime, recent_booking_count)

    return Response({
        "ground_id": ground.id,
        "ground_name": ground.name,
        "base_price": ground.price,
        "final_price": price,
        "use_dynamic_pricing": ground.use_dynamic_pricing,
        "datetime": booking_datetime.strftime("%Y-%m-%d %H:%M")
    })


# ---------------------------------------------------------------------
# User and Owner booking lists
# ---------------------------------------------------------------------
class UserBookingsView(generics.ListAPIView):
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('ground', 'user', 'ground__owner').order_by("-booking_date", "-time_slot")


class OwnerBookingHistoryView(generics.ListAPIView):
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'owner_profile'):
            owner = self.request.user.owner_profile
            grounds = owner.grounds.all()
            qs = Booking.objects.filter(ground__in=grounds).select_related('ground', 'user', 'ground__owner')
            date = self.request.query_params.get('date')
            if date:
                qs = qs.filter(booking_date=date)
            return qs.order_by('booking_date', 'time_slot')
        return Booking.objects.none()

    @action(detail=False, methods=['post'], url_path='cancel-booking/(?P<booking_id>[^/.]+)')
    def owner_cancel_booking(self, request, booking_id=None):
        """Owner cancellation with refund policy using utility service"""
        try:
            booking = get_object_or_404(Booking, id=booking_id)
        except Booking.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Booking not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is the owner of the ground
        if not hasattr(request.user, 'owner_profile') or booking.ground.owner != request.user.owner_profile:
            return Response({
                'success': False,
                'error': 'You do not have permission to cancel this booking.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Validate cancellation request
        serializer = CancelBookingRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use the cancellation service to process cancellation
            success, message, refund_amount, updated_booking = BookingCancellationService.process_cancellation(booking)
            
            if success:
                # Serialize the response
                response_serializer = CancellationResponseSerializer({
                    'success': True,
                    'message': message,
                    'refund_amount': refund_amount,
                    'refund_eligible': updated_booking.is_refund_eligible,
                    'cancellation_time': updated_booking.cancelled_at,
                    'booking': updated_booking
                })
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': message
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'An unexpected error occurred while cancelling the booking.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------
# Secure Booking Cancellation (Legacy - keeping for backward compatibility)
# ---------------------------------------------------------------------
class CancelBookingView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def update(self, request, *args, **kwargs):
        try:
            booking = Booking.objects.get(id=kwargs['id'])
        except Booking.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Booking not found'
            }, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        owner_user = getattr(booking.ground.owner, 'user', None)

        if not (user == booking.user or user == owner_user or user.is_staff or user.is_superuser):
            return Response({
                "success": False,
                "error": "You do not have permission to cancel this booking."
            }, status=status.HTTP_403_FORBIDDEN)

        if booking.status == 'cancelled':
            return Response({
                'success': False,
                'error': 'Booking already cancelled.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use the cancellation service to process cancellation
            success, message, refund_amount, updated_booking = BookingCancellationService.process_cancellation(booking)
            
            if success:
                response_serializer = CancellationResponseSerializer({
                    'success': True,
                    'message': message,
                    'refund_amount': refund_amount,
                    'refund_eligible': updated_booking.is_refund_eligible,
                    'cancellation_time': updated_booking.cancelled_at,
                    'booking': updated_booking
                })
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': message
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'An unexpected error occurred while cancelling the booking.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------
# Grounds by owner
# ---------------------------------------------------------------------
class GroundsByOwnerView(generics.ListAPIView):
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        owner_id = kwargs['owner_id']
        try:
            owner = OwnerProfile.objects.get(id=owner_id)
            grounds = owner.grounds.all()
            data = []

            for g in grounds:
                slot_prices = []
                for slot in g.available_time_slots:
                    start_time_str = slot.split("-")[0].strip()
                    booking_datetime = datetime.combine(datetime.today(), datetime.strptime(start_time_str, "%H:%M").time())
                    price = g.get_price_for_slot(slot)
                    slot_prices.append({"slot": slot, "price": price})

                data.append({
                    'id': g.id,
                    'name': g.name,
                    'ground_type': g.ground_type,
                    'available_time_slots': g.available_time_slots,
                    'slot_prices': slot_prices,
                    'images': [img.image.url for img in g.images.all()] if hasattr(g, 'images') else []
                })

            return Response({'grounds': data})
        except OwnerProfile.DoesNotExist:
            return Response({'error': 'Owner not found'}, status=404)


# ---------------------------------------------------------------------
# Demo Account Management (for testing)
# ---------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_demo_accounts(request):
    """Get list of demo accounts for testing"""
    demo_accounts = DemoPaymentAccount.objects.all()
    data = [
        {
            'username': account.username,
            'pin': account.pin,
            'balance': float(account.balance)
        }
        for account in demo_accounts
    ]
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reset_demo_accounts(request):
    """Reset demo accounts to default balances (for testing)"""
    try:
        # Reset demo1 to 1000
        demo1, created = DemoPaymentAccount.objects.get_or_create(
            username="demo1",
            defaults={'pin': '1234', 'balance': 1000}
        )
        if not created:
            demo1.balance = 1000
            demo1.save()

        # Reset demo2 to 500
        demo2, created = DemoPaymentAccount.objects.get_or_create(
            username="demo2",
            defaults={'pin': '5678', 'balance': 500}
        )
        if not created:
            demo2.balance = 500
            demo2.save()

        return Response({
            'message': 'Demo accounts reset successfully',
            'demo1_balance': float(demo1.balance),
            'demo2_balance': float(demo2.balance)
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)