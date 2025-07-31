from rest_framework import serializers
from .models import Booking
from ownerAPI.models import OwnerProfile
import datetime

class BookingSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    time_slot = serializers.ChoiceField(choices=[], required=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'ground', 'booking_date', 'time_slot', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        request = self.context.get('request')
        if request and request.method in ['POST', 'PUT', 'PATCH']:
            ground_id = request.data.get('ground')
            if ground_id:
                try:
                    ground = OwnerProfile.objects.get(id=ground_id)
                    self.fields['time_slot'].choices = [(slot, slot) for slot in ground.available_time_slots]
                except OwnerProfile.DoesNotExist:
                    pass

    def validate(self, data):
        if data['booking_date'] < datetime.date.today():
            raise serializers.ValidationError("Booking date cannot be in the past.")
        return data
