from rest_framework import serializers
from .models import OwnerProfile, Ground, GroundImage
from userAPI.models import CustomUser
from userAPI.serializers import CustomUserSerializer


class GroundImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroundImage
        fields = ['id', 'image', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']  # image is writable


class GroundSerializer(serializers.ModelSerializer):
    # Make ground_images writable
    ground_images = GroundImageSerializer(many=True, required=False)

    available_time_slots = serializers.ReadOnlyField()
    image_count = serializers.ReadOnlyField()

    class Meta:
        model = Ground
        fields = [
            'id',
            'ground_type',
            'opening_time',
            'closing_time',
            'price',
            'available_time_slots',
            'image_count',
            'ground_images',
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('ground_images', [])
        grounds = Ground.objects.create(**validated_data)

        for image_data in images_data:
            GroundImage.objects.create(ground=grounds, **image_data)

        return grounds

    def update(self, instance, validated_data):
        images_data = validated_data.pop('ground_images', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Optional: handle images update logic here if needed
        # For simplicity, we only add new images here
        for image_data in images_data:
            GroundImage.objects.create(ground=instance, **image_data)

        return instance


class OwnerProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    grounds = GroundSerializer(many=True)

    class Meta:
        model = OwnerProfile
        fields = [
            'id',
            'user',
            'futsal_name',
            'location',
            'grounds',
        ]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        grounds_data = validated_data.pop('grounds')

        password = user_data.pop('password')
        user_data.pop('confirm_password', None)

        user = CustomUser.objects.create_user(
            username=user_data['username'],
            email=user_data['email'],
            password=password,
            **{k: v for k, v in user_data.items() if k not in ['email', 'username']}
        )
        user.is_owner = True
        user.save()

        owner_profile = OwnerProfile.objects.create(user=user, **validated_data)

        for ground_data in grounds_data:
            # Use GroundSerializer.create to handle nested images
            ground_serializer = GroundSerializer(data=ground_data)
            ground_serializer.is_valid(raise_exception=True)
            ground_serializer.save(owner=owner_profile)

        return owner_profile

    def validate(self, data):
        user_data = data.get('user')
        if user_data and user_data.get('password') != user_data.get('confirm_password'):
            raise serializers.ValidationError("Passwords do not match.")
        return data
