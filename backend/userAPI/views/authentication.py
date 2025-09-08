
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
from rest_framework.viewsets import ModelViewSet


from ..serializers import (
    CustomUserSerializer,
    MyTokenObtainPairSerializer,
    CustomUserUpdateSerializer,
)
from ..models import CustomUser
from ..permessions import IsAdmin
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
