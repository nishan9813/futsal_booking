import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.middleware.csrf import get_token

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .serializers import CustomUserSerializer, LoginSerializer
from ownerAPI.models import OwnerProfile

logger = logging.getLogger(__name__)
User = get_user_model()


@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """
    Return the CSRF token to the client.
    """
    token = get_token(request)
    return JsonResponse({"csrfToken": token})

# API view to register a new user.
class RegisterUserView(generics.CreateAPIView):

    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]


    """
    API view to log in a user using session authentication.
    """
class SessionLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            login(request, user)

            role = (
                "admin" if user.is_superuser else
                "staff" if user.is_staff else
                "owner" if getattr(user, "is_owner", False) else
                "user"
            )

            return Response({
                "message": "Login successful",
                "username": user.username,
                "email": user.email,
                "role": role,
                # Add other fields here if needed, e.g.:
                # "futsal_name": user.futsal_name,
                # "location": user.location,
                # "contact": user.contact,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Log out the currently authenticated user.
    """
    logger.info(f"Logout request received: method={request.method}, path={request.path}")
    logout(request)
    return JsonResponse({"message": "User logged out successfully"}, status=200)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user

    # Determine role explicitly
    if user.is_superuser:
        role = "admin"
    elif hasattr(user, "owner_profile"):
        role = "owner"
    else:
        role = "user"

    # Base user info
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": getattr(user, "phone", None),
        "profile_pic": user.profile_pic.url if getattr(user, "profile_pic", None) else None,
        "role": role,
    }

    # Role-specific data
    if role == "admin":
        user_data["is_admin"] = True

    elif role == "owner":
        try:
            owner_profile = user.owner_profile
            grounds = owner_profile.grounds.all()

            ground_list = []
            for ground in grounds:
                ground_list.append({
                    "id": ground.id,
                    "ground_type": ground.ground_type,
                    "opening_time": ground.opening_time.strftime("%H:%M"),
                    "closing_time": ground.closing_time.strftime("%H:%M"),
                    "price": ground.price,
                    "available_time_slots": ground.available_time_slots,
                    "image_count": ground.image_count(),
                })

            user_data.update({
                "is_owner": True,
                "futsal_name": owner_profile.futsal_name,
                "location": owner_profile.location,
                "grounds": ground_list,
            })
        except OwnerProfile.DoesNotExist:
            user_data["owner_profile"] = None

    else:
        user_data["is_customer"] = getattr(user, "is_customer", False)

    return JsonResponse({"user": user_data})