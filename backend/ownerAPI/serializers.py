# from rest_framework import serializers
# from .models import OwnerProfile, Ground, GroundImage
# from userAPI.models import CustomUser
# from userAPI.serializers import CustomUserSerializer



# class GroundImageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = GroundImage
#         fields = ['id', 'image', 'uploaded_at']
#         read_only_fields = ['id', 'uploaded_at']  # image is writable


# class GroundSerializer(serializers.ModelSerializer):
#     # Make ground_images writable
#     ground_images = GroundImageSerializer(many=True, required=False)

#     available_time_slots = serializers.ReadOnlyField()
#     image_count = serializers.ReadOnlyField()

#     class Meta:
#         model = Ground
#         fields = [
#             'id',
#             'ground_type',
#             'opening_time',
#             'closing_time',
#             'price',
#             'available_time_slots',
#             'image_count',
#             'ground_images',

#         ]

#     # def create(self, validated_data):
#     #     images_data = validated_data.pop('ground_images', [])
#     #     grounds = Ground.objects.create(**validated_data)

#     #     for image_data in images_data:
#     #         GroundImage.objects.create(ground=grounds, **image_data)

#     #     return grounds

#     def create(self, validated_data):
#         request = self.context.get('request')

#         user_data = validated_data.pop('user')
#         grounds_data = validated_data.pop('grounds')

#         # Validate passwords match (optional backup check)
#         password = user_data.get('password')
#         confirm_password = user_data.get('confirm_password')
#         if password != confirm_password:
#             raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

#         # Create user
#         profile_pic = user_data.pop('profile_pic', None)
#         user_data.pop('confirm_password', None)
#         user = CustomUser.objects.create_user(
#             username=user_data['username'],
#             email=user_data['email'],
#             password=password,
#             **{k: v for k, v in user_data.items() if k not in ['username', 'email']}
#         )
#         user.is_owner = True
#         if profile_pic:
#             user.profile_pic = profile_pic
#         user.save()

#         # Create owner profile
#         owner_profile = OwnerProfile.objects.create(user=user, **validated_data)

#         # Create grounds and images
#         for i, ground_data in enumerate(grounds_data):
#             ground = Ground.objects.create(owner=owner_profile, **{
#                 key: ground_data[key]
#                 for key in ['ground_type', 'opening_time', 'closing_time', 'price']
#                 if key in ground_data
#             })

#             images = request.FILES.getlist(f'grounds[{i}].ground_images')
#             for image in images:
#                 GroundImage.objects.create(ground=ground, image=image)

#         return owner_profile


#     def update(self, instance, validated_data):
#         images_data = validated_data.pop('ground_images', [])
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()

#         # Optional: handle images update logic here if needed
#         # For simplicity, we only add new images here
#         for image_data in images_data:
#             GroundImage.objects.create(ground=instance, **image_data)

#         return instance



# class OwnerProfileSerializer(serializers.ModelSerializer):
#     user = CustomUserSerializer()
#     grounds = GroundSerializer(many=True)

#     class Meta:
#         model = OwnerProfile
#         fields = [
#             'id',
#             'user',
#             'futsal_name',
#             'location',
#             'grounds',
#         ]

#     def create(self, validated_data):
#         request = self.context.get('request')  # ✅ Access request.FILES
#         user_data = validated_data.pop('user')
#         grounds_data = validated_data.pop('grounds')

#         # Extract password and clean up
#         password = user_data.pop('password')
#         user_data.pop('confirm_password', None)

#         user = CustomUser.objects.create_user(
#             username=user_data['username'],
#             email=user_data['email'],
#             password=password,
#             **{k: v for k, v in user_data.items() if k not in ['email', 'username']}
#         )
#         user.is_owner = True
#         user.save()

#         # Create owner profile
#         owner_profile = OwnerProfile.objects.create(user=user, **validated_data)

#         # Handle grounds
#         for i, ground_data in enumerate(grounds_data):
#             # Create ground object first
#             ground = Ground.objects.create(owner=owner_profile, **{
#                 key: ground_data[key]
#                 for key in ['ground_type', 'opening_time', 'closing_time', 'price']
#                 if key in ground_data
#             })

#             # Extract and save image files
#             images = request.FILES.getlist(f'grounds[{i}].ground_images')
#             for image in images:
#                 GroundImage.objects.create(ground=ground, image=image)

#         return owner_profile

#     def validate(self, data):
#         user_data = data.get('user')
#         if user_data and user_data.get('password') != user_data.get('confirm_password'):
#             raise serializers.ValidationError("Passwords do not match.")
#         return data






# from rest_framework import serializers
# from .models import GroundPricing

# class GroundPricingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = GroundPricing
#         fields = ['id', 'ground', 'day_of_week', 'start_time', 'end_time','price_per_hour']
#         read_only_fields = ['id']

#     def validate(self, data):
#         if data['start_time'] >= data['end_time']:
#             raise serializers.ValidationError("Start time must be before end time.")
#         return data













from rest_framework import serializers
from .models import OwnerProfile, Ground, GroundImage, GroundPricing
from userAPI.serializers import CustomUserSerializer


class GroundImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroundImage
        fields = ['id', 'image', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class GroundSerializer(serializers.ModelSerializer):
    ground_images = GroundImageSerializer(many=True, required=False, read_only=True)
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
        ]

    def get_available_time_slots(self, obj):
        # Return time slots formatted as strings like "05:00 - 06:00"
        slots = []
        for start_time, end_time in obj.available_time_slots:
            slots.append(f"{start_time.strftime('%H:%M')} - {end_time.strftime('%H:%M')}")
        return slots

    def get_image_count(self, obj):
        return obj.ground_images.count()

    def create(self, validated_data):
        images_data = self.context['request'].FILES.getlist('ground_images') if self.context.get('request') else []
        ground = Ground.objects.create(**validated_data)
        for image in images_data:
            GroundImage.objects.create(ground=ground, image=image)
        return ground


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
        return obj.latitude if obj.location else None

    def get_longitude(self, obj):
        return obj.longitude if obj.location else None

    def get_google_maps_url(self, obj):
        if obj.latitude and obj.longitude:
            return f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        grounds_data = validated_data.pop('grounds', [])

        # Use logged-in user for owner profile
        user = request.user if request else None
        owner_profile = OwnerProfile.objects.create(user=user, **validated_data)

        # Create grounds and their images
        for i, ground_data in enumerate(grounds_data):
            images = []
            # Extract ground_images nested data if present
            if 'ground_images' in ground_data:
                images = ground_data.pop('ground_images')
            
            ground = Ground.objects.create(owner=owner_profile, **ground_data)

            # Create ground images from nested data
            for image_data in images:
                GroundImage.objects.create(ground=ground, **image_data)

            # Additionally handle files from multipart/form-data if any (optional)
            if request:
                file_key = f'grounds[{i}].ground_images'
                files = request.FILES.getlist(file_key)
                for f in files:
                    GroundImage.objects.create(ground=ground, image=f)

        return owner_profile

    def update(self, instance, validated_data):
        grounds_data = validated_data.pop('grounds', None)

        # Update OwnerProfile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if grounds_data is not None:
            # Clear existing grounds and images
            for ground in instance.grounds.all():
                ground.ground_images.all().delete()
            instance.grounds.all().delete()

            request = self.context.get('request')

            # Recreate grounds and their images
            for i, ground_data in enumerate(grounds_data):
                images = []
                if 'ground_images' in ground_data:
                    images = ground_data.pop('ground_images')

                ground = Ground.objects.create(owner=instance, **ground_data)

                for image_data in images:
                    GroundImage.objects.create(ground=ground, **image_data)

                if request:
                    file_key = f'grounds[{i}].ground_images'
                    files = request.FILES.getlist(file_key)
                    for f in files:
                        GroundImage.objects.create(ground=ground, image=f)

        return instance
