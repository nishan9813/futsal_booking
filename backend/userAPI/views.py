import logging

from django.contrib.auth import get_user_model
from rest_framework import viewsets
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from .serializers import (
    CustomUserSerializer,
    MyTokenObtainPairSerializer,
    CustomUserUpdateSerializer,
)
from .models import CustomUser
from .permessions import IsAdmin
from ownerAPI.models import OwnerProfile
from bookingAPI.models import Booking  # adjust import path as needed

logger = logging.getLogger(__name__)
User = get_user_model()


# ---------------------------
# Register New User API
# ---------------------------
class RegisterUserView(generics.CreateAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]


# ---------------------------
# JWT Token Obtain (Login) View
# ---------------------------
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# ---------------------------
# Get Current Logged-In User Details
# ---------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user

    if user.is_superuser:
        role = "admin"
    elif hasattr(user, "owner_profile"):
        role = "owner"
    else:
        role = "user"

    profile_pic_url = None
    if user.profile_pic and hasattr(user.profile_pic, 'url'):
        scheme = 'https' if request.is_secure() else 'http'
        domain = request.get_host()
        profile_pic_url = f"{scheme}://{domain}{user.profile_pic.url}"

    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "profile_pic": profile_pic_url,
        "is_owner": getattr(user, "is_owner", False),
        "is_customer": getattr(user, "is_customer", False),
        "is_staff": user.is_staff,
        "is_active": user.is_active,
        "date_joined": user.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
        "role": role,
    }

    if role == "admin":
        user_data["is_admin"] = True

    elif role == "owner":
        try:
            owner_profile = user.owner_profile
            grounds = owner_profile.grounds.all()

            ground_list = []
            all_bookings = []

            for ground in grounds:
                ground_bookings = Booking.objects.filter(ground=ground).select_related("user")

                booking_data = [{
                    "id": b.id,
                    "user": b.user.username,
                    "date": b.booking_date.strftime("%Y-%m-%d"),
                    "time_slot": b.time_slot,
                    "status": b.status,
                    "ground_id": ground.id,
                } for b in ground_bookings]

                all_bookings.extend(booking_data)

                ground_list.append({
                    "id": ground.id,
                    "ground_type": ground.ground_type,
                    "opening_time": ground.opening_time.strftime("%H:%M"),
                    "closing_time": ground.closing_time.strftime("%H:%M"),
                    "price": ground.price,
                    "available_time_slots": ground.available_time_slots,
                    "images": [img.image.url for img in ground.ground_images.all()],
                })

            user_data.update({
                "futsal_name": owner_profile.futsal_name,
                "location": owner_profile.location,
                "grounds": ground_list,
                "bookings": all_bookings,
            })

        except OwnerProfile.DoesNotExist:
            user_data["owner_profile"] = None

    else:
        user_bookings = Booking.objects.filter(user=user).select_related("ground")
        booking_list = [{
            "id": b.id,
            "ground": b.ground.ground_type,
            "date": b.booking_date.strftime("%Y-%m-%d"),
            "time_slot": b.time_slot,
            "status": b.status,
        } for b in user_bookings]
        user_data["bookings"] = booking_list

    return Response({"user": user_data})


# ---------------------------
# Logout View (Token Blacklisting)
# ---------------------------
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token is None:
                return Response(
                    {"detail": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"detail": "Logout successful."},
                status=status.HTTP_205_RESET_CONTENT
            )

        except (TokenError, InvalidToken):
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST
            )


# ---------------------------
# Update Current User Profile
# ---------------------------
class UserUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomUserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user




class CustomUserAdminView(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAdmin]