from rest_framework import serializers
from django.db import transaction
from .models import OwnerProfile, Ground, GroundImage, GroundPricing
from userAPI.serializers import CustomUserSerializer
import math


class GroundImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroundImage
        fields = ['id', 'image', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class GroundPricingSerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = GroundPricing
        fields = [
            "id",
            "day_of_week",
            "day_of_week_display",
            "start_time",
            "end_time",
            "price_per_hour",
        ]


class GroundSerializer(serializers.ModelSerializer):
    ground_images = GroundImageSerializer(many=True, required=False)
    pricing_rules = GroundPricingSerializer(many=True, required=False)
    available_time_slots = serializers.SerializerMethodField()
    image_count = serializers.SerializerMethodField()

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
            'pricing_rules',
        ]

    def get_available_time_slots(self, obj):
        return obj.available_time_slots

    def get_image_count(self, obj):
        return obj.ground_images.count()

    @transaction.atomic
    def create(self, validated_data):
        pricing_data = validated_data.pop("pricing_rules", [])
        images_data = validated_data.pop("ground_images", [])
        request = self.context.get('request')
        files = request.FILES.getlist('ground_images') if request else []

        ground = Ground.objects.create(**validated_data)

        # Create pricing rules if dynamic pricing enabled
        if validated_data.get("use_dynamic_pricing", False):
            for pr in pricing_data:
                GroundPricing.objects.create(ground=ground, **pr)

        # Create images from nested data (if any)
        for image_data in images_data:
            GroundImage.objects.create(ground=ground, **image_data)

        # Create images from request files (multipart)
        for f in files:
            GroundImage.objects.create(ground=ground, image=f)

        return ground

    @transaction.atomic
    def update(self, instance, validated_data):
        pricing_data = validated_data.pop("pricing_rules", None)
        images_data = validated_data.pop("ground_images", None)
        request = self.context.get('request')
        files = request.FILES.getlist('ground_images') if request else []

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update pricing rules
        if instance.use_dynamic_pricing and pricing_data is not None:
            instance.pricing_rules.all().delete()
            for pr in pricing_data:
                GroundPricing.objects.create(ground=instance, **pr)

        # Update images if provided
        if images_data is not None or files:
            # Delete existing images
            instance.ground_images.all().delete()

            # Create from nested serializer data
            if images_data:
                for image_data in images_data:
                    GroundImage.objects.create(ground=instance, **image_data)

            # Create from uploaded files
            for f in files:
                GroundImage.objects.create(ground=instance, image=f)

        return instance


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
            # Delete existing grounds and images
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



