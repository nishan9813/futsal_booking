# admin_views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import datetime, timedelta

from userAPI.models import CustomUser
from ownerAPI.models import OwnerProfile, Ground
from bookingAPI.models import Booking, Payment
from .adminSerializers import (
    AdminUserSerializer, AdminOwnerProfileSerializer, 
    AdminGroundSerializer, AdminBookingSerializer, AdminStatsSerializer
)
from .permessions import IsAdmin
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        # Calculate statistics
        total_users = CustomUser.objects.count()
        total_owners = CustomUser.objects.filter(is_owner=True).count()
        total_customers = CustomUser.objects.filter(is_customer=True, is_owner=False).count()
        total_grounds = Ground.objects.count()
        total_bookings = Booking.objects.count()
        
        # Calculate revenue from successful payments
        total_revenue = Payment.objects.filter(status='success').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        pending_bookings = Booking.objects.filter(status='booked').count()
        active_bookings = Booking.objects.filter(
            status='booked',
            booking_date__gte=timezone.now().date()
        ).count()
        
        stats = {
            'total_users': total_users,
            'total_owners': total_owners,
            'total_customers': total_customers,
            'total_grounds': total_grounds,
            'total_bookings': total_bookings,
            'total_revenue': total_revenue,
            'pending_bookings': pending_bookings,
            'active_bookings': active_bookings,
        }
        
        serializer = AdminStatsSerializer(stats)
        return Response(serializer.data)

class AdminUserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = CustomUser.objects.all()
    serializer_class = AdminUserSerializer
    
    def get_queryset(self):
        queryset = CustomUser.objects.all()
        user_type = self.request.query_params.get('user_type', None)
        
        if user_type == 'owner':
            queryset = queryset.filter(is_owner=True)
        elif user_type == 'customer':
            queryset = queryset.filter(is_customer=True, is_owner=False)
        elif user_type == 'admin':
            queryset = queryset.filter(is_staff=True)
        
        return queryset.order_by('-date_joined')
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({
            'status': 'success',
            'message': f'User {"activated" if user.is_active else "deactivated"}',
            'is_active': user.is_active
        })
    
    @action(detail=True, methods=['post'])
    def make_owner(self, request, pk=None):
        user = self.get_object()
        user.is_owner = True
        user.is_customer = False
        user.save()
        
        # Create owner profile if it doesn't exist
        OwnerProfile.objects.get_or_create(
            user=user,
            defaults={
                'futsal_name': f"{user.username}'s Futsal",
                'city': 'Kathmandu'
            }
        )
        
        return Response({
            'status': 'success',
            'message': 'User promoted to owner'
        })

class AdminOwnerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = OwnerProfile.objects.all()
    serializer_class = AdminOwnerProfileSerializer
    
    def get_queryset(self):
        return OwnerProfile.objects.select_related('user').prefetch_related('grounds')

class AdminGroundViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Ground.objects.all()
    serializer_class = AdminGroundSerializer
    
    def get_queryset(self):
        return Ground.objects.select_related('owner', 'owner__user')

class AdminBookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Booking.objects.all()
    serializer_class = AdminBookingSerializer
    
    def get_queryset(self):
        queryset = Booking.objects.select_related(
            'user', 'ground', 'ground__owner'
        )
        
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in ['booked', 'cancelled', 'completed']:
            booking.status = new_status
            if new_status == 'cancelled':
                booking.cancelled_at = timezone.now()
            booking.save()
            
            return Response({
                'status': 'success',
                'message': f'Booking status updated to {new_status}'
            })
        
        return Response({
            'error': 'Invalid status'
        }, status=status.HTTP_400_BAD_REQUEST)
        