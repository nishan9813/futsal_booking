import re
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CustomUser


# -------------------------
# 1. CREATE USER SERIALIZER
# -------------------------
class CustomUserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'first_name', 'last_name', 'username', 'email',
            'password', 'confirm_password', 'phone', 'profile_pic'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_phone(self, value):
        """Validate Nepal phone number format: +977 followed by 10 digits."""
        if not re.match(r"^\+977(98|97)\d{8}$", value):
            raise serializers.ValidationError(
                "Phone number musb me valide nepali number.")

        return value

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        email = validated_data.pop('email')
        username = validated_data.pop('username')

        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            username=username,
            **validated_data
        )
        return user


# -------------------------
# 2. JWT TOKEN SERIALIZER
# -------------------------
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email

        if user.is_superuser:
            role = 'admin'
        elif user.is_staff:
            role = 'staff'
        elif getattr(user, 'is_owner', False):
            role = 'owner'
        else:
            role = 'user'
        token['role'] = role

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({
            'username': self.user.username,
            'email': self.user.email,
            'role': (
                'admin' if self.user.is_superuser else
                'staff' if self.user.is_staff else
                'owner' if getattr(self.user, 'is_owner', False) else
                'user'
            )
        })
        return data


# -------------------------
# 3. UPDATE USER SERIALIZER
# -------------------------
User = get_user_model()


class CustomUserUpdateSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False)
    new_password_confirm = serializers.CharField(write_only=True, required=False)
    profile_pic = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'phone', 'profile_pic', 'old_password',
            'new_password', 'new_password_confirm',
        ]
        extra_kwargs = {
            'profile_pic': {'required': False, 'allow_null': True},
            'email': {'required': True},
            'username': {'required': True},
        }

    def validate_phone(self, value):
        """Validate Nepal phone number format: +977 followed by 10 digits."""
        if not re.match(r"^\+977\d{10}$", value):
            raise serializers.ValidationError(
                "Phone number must be in the format +977XXXXXXXXXX (Nepal)."
            )
        return value

    def validate_email(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        return value

    def validate_username(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

    def validate(self, attrs):
        user = self.instance
        old_password = attrs.get('old_password')
        new_password = attrs.get('new_password')
        new_password_confirm = attrs.get('new_password_confirm')

        if new_password or new_password_confirm or old_password:
            if not old_password:
                raise serializers.ValidationError(
                    {"old_password": "Old password is required to change password."}
                )
            if not new_password:
                raise serializers.ValidationError(
                    {"new_password": "New password is required."}
                )
            if not new_password_confirm:
                raise serializers.ValidationError(
                    {"new_password_confirm": "Please confirm your new password."}
                )
            if not user.check_password(old_password):
                raise serializers.ValidationError(
                    {"old_password": "Old password is incorrect."}
                )
            if new_password != new_password_confirm:
                raise serializers.ValidationError(
                    {"new_password_confirm": "New password fields do not match."}
                )

            validate_password(new_password, user)

        return attrs

    def update(self, instance, validated_data):
        old_password = validated_data.pop('old_password', None)
        new_password = validated_data.pop('new_password', None)
        validated_data.pop('new_password_confirm', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if new_password:
            instance.set_password(new_password)

        instance.save()
        return instance



class UserLocationSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
