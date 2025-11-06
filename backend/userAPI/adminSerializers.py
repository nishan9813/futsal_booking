# admin_serializers.py (create this file)
from rest_framework import serializers
from userAPI.models import CustomUser
from ownerAPI.models import OwnerProfile, Ground, GroundImage
from bookingAPI.models import Booking, Payment, DemoPaymentAccount

class AdminUserSerializer(serializers.ModelSerializer):
    user_type = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone', 'is_owner', 'is_customer', 'is_staff', 'is_active',
            'date_joined', 'user_type'
        ]
    
    def get_user_type(self, obj):
        if obj.is_staff:
            return 'Admin'
        elif obj.is_owner:
            return 'Owner'
        else:
            return 'Customer'

class AdminOwnerProfileSerializer(serializers.ModelSerializer):
    user_info = serializers.SerializerMethodField()
    total_grounds = serializers.SerializerMethodField()
    
    class Meta:
        model = OwnerProfile
        fields = [
            'id', 'user', 'user_info', 'futsal_name', 'city', 'address', 
            'country', 'location', 'total_grounds'
        ]
    
    def get_user_info(self, obj):
        return {
            'username': obj.user.username,
            'email': obj.user.email,
            'phone': obj.user.phone
        }
    
    def get_total_grounds(self, obj):
        return obj.grounds.count()

class AdminGroundSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.futsal_name', read_only=True)
    total_bookings = serializers.SerializerMethodField()
    
    class Meta:
        model = Ground
        fields = [
            'id', 'name', 'ground_type', 'owner', 'owner_name',
            'opening_time', 'closing_time', 'price', 
            'use_dynamic_pricing', 'total_bookings'
        ]
    
    def get_total_bookings(self, obj):
        return obj.booking_set.count()

class AdminBookingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    ground_name = serializers.CharField(source='ground.name', read_only=True)
    futsal_name = serializers.CharField(source='ground.owner.futsal_name', read_only=True)
    payment_status = serializers.SerializerMethodField()
    amount_paid = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_name', 'ground', 'ground_name', 'futsal_name',
            'booking_date', 'time_slot', 'status', 'created_at', 'cancelled_at',
            'refund_amount', 'payment_status', 'amount_paid'
        ]
    
    def get_payment_status(self, obj):
        if hasattr(obj, 'payment'):
            return obj.payment.status
        return 'no_payment'
    
    def get_amount_paid(self, obj):
        if hasattr(obj, 'payment'):
            return obj.payment.amount
        return 0

class AdminStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_owners = serializers.IntegerField()
    total_customers = serializers.IntegerField()
    total_grounds = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_bookings = serializers.IntegerField()
    active_bookings = serializers.IntegerField()