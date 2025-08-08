import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.middleware.csrf import get_token

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

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
    return Response({"csrfToken": token})

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



# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def current_user(request):
#     user = request.user

#     # Determine role explicitly
#     if user.is_superuser:
#         role = "admin"
#     elif hasattr(user, "owner_profile"):
#         role = "owner"
#     else:
#         role = "user"

#     # Base user info
#     user_data = {
#         "id": user.id,
#         "username": user.username,
#         "email": user.email,
#         "first_name": user.first_name,
#         "last_name": user.last_name,
#         "phone": getattr(user, "phone", None),
#         "profile_pic": user.profile_pic.url if getattr(user, "profile_pic", None) else None,
#         "role": role,
#     }

#     # Role-specific data
#     if role == "admin":
#         user_data["is_admin"] = True

#     elif role == "owner":
#         try:
#             owner_profile = user.owner_profile
#             grounds = owner_profile.grounds.all()

#             ground_list = []
#             for ground in grounds:
#                 ground_list.append({
#                     "id": ground.id,
#                     "ground_type": ground.ground_type,
#                     "opening_time": ground.opening_time.strftime("%H:%M"),
#                     "closing_time": ground.closing_time.strftime("%H:%M"),
#                     "price": ground.price,
#                     "available_time_slots": ground.available_time_slots,
#                     "image_count": ground.image_count,
#                 })

#             user_data.update({
#                 "is_owner": True,
#                 "futsal_name": owner_profile.futsal_name,
#                 "location": owner_profile.location,
#                 "grounds": ground_list,
#             })
#         except OwnerProfile.DoesNotExist:
#             user_data["owner_profile"] = None

#     else:
#         user_data["is_customer"] = getattr(user, "is_customer", False)

#     return JsonResponse({"user": user_data})



from bookingAPI.models import Booking  # Adjust to your actual path

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def current_user(request):
#     user = request.user

#     if user.is_superuser:
#         role = "admin"
#     elif hasattr(user, "owner_profile"):
#         role = "owner"
#     else:
#         role = "user"

#     user_data = {
#         "id": user.id,
#         "username": user.username,
#         "email": user.email,
#         "first_name": user.first_name,
#         "last_name": user.last_name,
#         "phone": getattr(user, "phone", None),
#         "profile_pic": user.profile_pic.url if user.profile_pic and hasattr(user.profile_pic, 'url') else None,
#         "role": role,
#     }

#     if role == "admin":
#         user_data["is_admin"] = True

#     elif role == "owner":
#         try:
#             owner_profile = user.owner_profile
#             grounds = owner_profile.grounds.all()

#             ground_list = []
#             all_bookings = []

#             for ground in grounds:
#                 ground_bookings = Booking.objects.filter(ground=ground).select_related("user")
#                 booking_data = [{
#                     "id": b.id,
#                     "user": b.user.username,
#                     "date": b.booking_date.strftime("%Y-%m-%d"),
#                     "time_slot": b.time_slot,
#                     "status": b.status,
#                     "ground_id": ground.id,
#                 } for b in ground_bookings]

#                 all_bookings.extend(booking_data)

#                 ground_list.append({
#                     "id": ground.id,
#                     "ground_type": ground.ground_type,
#                     "opening_time": ground.opening_time.strftime("%H:%M"),
#                     "closing_time": ground.closing_time.strftime("%H:%M"),
#                     "price": ground.price,
#                     "available_time_slots": ground.available_time_slots,
#                     "image_count": ground.image_count,
#                     "images": [img.image.url for img in ground.ground_images.all()]
#                 })

#             user_data.update({
#                 "is_owner": True,
#                 "futsal_name": owner_profile.futsal_name,
#                 "location": owner_profile.location,
#                 "grounds": ground_list,
#                 "bookings": all_bookings,  # Add owner booking data here
#             })

#         except OwnerProfile.DoesNotExist:
#             user_data["owner_profile"] = None

#     else:
#         user_data["is_customer"] = getattr(user, "is_customer", False)
#         user_bookings = Booking.objects.filter(user=user).select_related("ground")
#         booking_list = [{
#             "id": b.id,
#             "ground": b.ground.ground_type,
#             "date": b.booking_date.strftime("%Y-%m-%d"),
#             "time_slot": b.time_slot,
#             "status": b.status,
#         } for b in user_bookings]
#         user_data["bookings"] = booking_list  # Add user booking data here

#     return JsonResponse({"user": user_data})



# @ensure_csrf_cookie
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

    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "profile_pic": user.profile_pic.url if user.profile_pic and hasattr(user.profile_pic, 'url') else None,
        "is_owner": user.is_owner,
        "is_customer": user.is_customer,
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
                    # "image_count": ground.image_count,
                    "images": [img.image.url for img in ground.ground_images.all()]
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

    return JsonResponse({"user": user_data})





from .serializers import adminEditSerializers
from .models import CustomUser
from .permessions import IsAdminOrCustomer

class adminEditView(RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = adminEditSerializers
    permission_classes = [IsAuthenticated]