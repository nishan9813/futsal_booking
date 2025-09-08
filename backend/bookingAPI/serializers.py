from rest_framework import serializers
from .models import Booking
from ownerAPI.models import Ground
import datetime

class BookingSerializer(serializers.ModelSerializer):
    # Automatically assign current user from JWT-authenticated request
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    customer_username = serializers.CharField(source='user.username', read_only=True)
    customer_email = serializers.EmailField(source='user.email', read_only=True)
    customer_phone = serializers.CharField(source='user.phone', read_only=True)  # if your User model has phone
    price = serializers.CharField(source='ground.price', read_only=True)

    
    # time_slot choices will be set dynamically in __init__
    time_slot = serializers.ChoiceField(choices=[], required=True)
    
    # Read-only field showing futsal name from related ground.owner
    futsal_name = serializers.CharField(source='ground.owner.futsal_name', read_only=True)
    ground_type = serializers.CharField(source='ground.ground_type', read_only=True)


    class Meta:
        model = Booking
        fields = ['id', 'user', 'ground', 'futsal_name', 'booking_date', 'time_slot', 'status', 'created_at', 'customer_username', 'customer_email', 'customer_phone','ground_type', 'price']
        read_only_fields = ['status', 'created_at','ground_type']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        
        # Dynamically set choices for time_slot based on ground's available_time_slots on write operations
        if request and request.method in ['POST', 'PUT', 'PATCH']:
            ground_id = request.data.get('ground')
            if ground_id:
                try:
                    ground = Ground.objects.get(id=ground_id)
                    slots = ground.available_time_slots
                    self.fields['time_slot'].choices = [(slot, slot) for slot in slots]
                except Ground.DoesNotExist:
                    self.fields['time_slot'].choices = []

    def validate_booking_date(self, value):
        # Prevent booking in the past
        if value < datetime.date.today():
            raise serializers.ValidationError("Booking date cannot be in the past.")
        return value
