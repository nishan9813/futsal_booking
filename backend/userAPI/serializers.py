from .models import CustomUser
from django.contrib.auth import authenticate
from rest_framework import serializers


class CustomUserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'first_name', 'last_name', 'username', 'email', 'password', 'confirm_password', 'phone', 'profile_pic',
        ]

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')  # 🔥 This is the missing line

        email = validated_data.pop('email')
        username = validated_data.pop('username')

        user = CustomUser.objects.create_user(  # using create_user automatically hashes the password
            email=email,
            password=password,
            username=username,
            **validated_data  # pass remaining fields
        )
        return user


from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials.")
        else:
            raise serializers.ValidationError("Both username and password are required.")

        data["user"] = user
        return data
