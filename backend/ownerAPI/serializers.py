from rest_framework import serializers
from django.db import transaction
from datetime import datetime
from .models import OwnerProfile, Ground, GroundImage
from userAPI.serializers import CustomUserSerializer
from .utils.dynamicPricing import calculate_dynamic_price
import openrouteservice

# Initialize OpenRouteService client
ORS_CLIENT = openrouteservice.Client(
    key="eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjFmY2EwZTY4ZWYwZjQ0MjI4ODkwZjg3MWYzNWQxMDljIiwiaCI6Im11cm11cjY0In0"
)

# ------------------------
# Ground Image Serializer
# ------------------------
class GroundImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroundImage
        fields = ['id', 'image', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


# ------------------------
# Full Ground Serializer
# ------------------------
class GroundSerializer(serializers.ModelSerializer):
    ground_images = GroundImageSerializer(many=True, required=False)
    available_time_slots = serializers.SerializerMethodField()
    image_count = serializers.SerializerMethodField()
    dynamic_price = serializers.SerializerMethodField()
    distance_meters = serializers.SerializerMethodField()

    class Meta:
        model = Ground
        fields = [
            'id',
            'name',
            'ground_type',
            'opening_time',
            'closing_time',
            'price',
            'use_dynamic_pricing',
            'available_time_slots',
            'image_count',
            'ground_images',
            'dynamic_price',
            'distance_meters',
        ]

    def get_available_time_slots(self, obj):
        return obj.available_time_slots

    def get_image_count(self, obj):
        return obj.ground_images.count()

    def get_dynamic_price(self, obj):
        request = self.context.get("request")
        booking_datetime = None
        if request and "datetime" in request.query_params:
            try:
                booking_datetime = datetime.fromisoformat(request.query_params["datetime"])
            except Exception:
                pass
        if not booking_datetime:
            booking_datetime = datetime.now()

        recent_booking_count = 0  # placeholder
        return calculate_dynamic_price(obj, booking_datetime, recent_booking_count)

    def get_distance_meters(self, obj):
        request = self.context.get("request")
        if not request:
            return None

        user_lat = request.query_params.get("latitude")
        user_lng = request.query_params.get("longitude")
        if not user_lat or not user_lng:
            return None

        try:
            user_lat = float(user_lat)
            user_lng = float(user_lng)
            owner_lat, owner_lng = map(float, obj.owner.location.split(","))

            routes = ORS_CLIENT.directions(
                coordinates=[[user_lng, user_lat], [owner_lng, owner_lat]],
                profile="driving-car",
                format="json"
            )
            return routes["routes"][0]["summary"]["distance"]
        except Exception:
            return None

    @transaction.atomic
    def create(self, validated_data):
        images_data = validated_data.pop("ground_images", [])
        request = self.context.get('request')
        files = request.FILES.getlist('ground_images') if request else []

        ground = Ground.objects.create(**validated_data)

        # Ground.save() auto-assigns name if blank
        for image_data in images_data:
            GroundImage.objects.create(ground=ground, **image_data)

        for f in files:
            GroundImage.objects.create(ground=ground, image=f)

        return ground

    @transaction.atomic
    def update(self, instance, validated_data):
        images_data = validated_data.pop("ground_images", None)
        request = self.context.get('request')
        files = request.FILES.getlist('ground_images') if request else []

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()  # Ground.save() ensures name exists

        if images_data is not None or files:
            instance.ground_images.all().delete()
            if images_data:
                for image_data in images_data:
                    GroundImage.objects.create(ground=instance, **image_data)
            for f in files:
                GroundImage.objects.create(ground=instance, image=f)

        return instance


# ------------------------
# Distance-only Serializer
# ------------------------
class GroundDistanceSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    distance_meters = serializers.FloatField(allow_null=True)


# ------------------------
# Owner Profile Serializer
# ------------------------
class OwnerProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    grounds = GroundSerializer(many=True, required=False)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    google_maps_url = serializers.SerializerMethodField()

    class Meta:
        model = OwnerProfile
        fields = [
            'id',
            'user',
            'futsal_name',
            'city',
            'location',
            'address',
            'country',
            'latitude',
            'longitude',
            'google_maps_url',
            'grounds',
        ]
        read_only_fields = ['latitude', 'longitude', 'google_maps_url']

    def get_latitude(self, obj):
        if obj.location:
            return obj.location.split(',')[0]
        return None

    def get_longitude(self, obj):
        if obj.location:
            return obj.location.split(',')[1]
        return None

    def get_google_maps_url(self, obj):
        if obj.location:
            lat, lng = obj.location.split(',')
            return f"https://www.google.com/maps?q={lat},{lng}"
        return None

    def _convert_location(self, location_str):
        if not location_str:
            return None
        parts = location_str.split(',')
        if len(parts) != 2:
            return None
        try:
            lat = float(parts[0])
            lng = float(parts[1])
            return f"{lat},{lng}"
        except ValueError:
            return None

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get('request')
        grounds_data = validated_data.pop('grounds', [])
        validated_data.pop('user', None)
        location_str = validated_data.pop('location', None)
        validated_data['location'] = self._convert_location(location_str)

        user = request.user if request else None
        if user and not user.is_owner:
            user.is_owner = True
            user.save()

        owner_profile = OwnerProfile.objects.create(user=user, **validated_data)

        for i, ground_data in enumerate(grounds_data):
            images = ground_data.pop('ground_images', [])
            ground = Ground.objects.create(owner=owner_profile, **ground_data)
            # Ground.save() auto-assigns name if blank
            for image_data in images:
                GroundImage.objects.create(ground=ground, **image_data)

            if request:
                file_key = f'grounds[{i}].ground_images'
                files = request.FILES.getlist(file_key)
                for f in files:
                    GroundImage.objects.create(ground=ground, image=f)

        return owner_profile

    @transaction.atomic
    def update(self, instance, validated_data):
        grounds_data = validated_data.pop('grounds', None)
        location_str = validated_data.pop('location', None)
        if location_str is not None:
            validated_data['location'] = self._convert_location(location_str)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if grounds_data is not None:
            for ground in instance.grounds.all():
                ground.ground_images.all().delete()
            instance.grounds.all().delete()

            request = self.context.get('request')
            for i, ground_data in enumerate(grounds_data):
                images = ground_data.pop('ground_images', [])
                ground = Ground.objects.create(owner=instance, **ground_data)
                for image_data in images:
                    GroundImage.objects.create(ground=ground, **image_data)

                if request:
                    file_key = f'grounds[{i}].ground_images'
                    files = request.FILES.getlist(file_key)
                    for f in files:
                        GroundImage.objects.create(ground=ground, image=f)

        return instance
