import json
import logging

from django.contrib.auth import get_user_model
from rest_framework import generics, status, serializers, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated

from .models import OwnerProfile, Ground
from .serializers import OwnerProfileSerializer, GroundSerializer, GroundImageSerializer
from .models import GroundImage

logger = logging.getLogger(__name__)
User = get_user_model()


# -----------------------------------------------------------
# Owner Registration View
# -----------------------------------------------------------
class RegisterOwnerView(generics.CreateAPIView):
    serializer_class = OwnerProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user

        if not user.is_customer or user.is_owner:
            return Response(
                {"detail": "You are not allowed to register as an owner."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if OwnerProfile.objects.filter(user=user).exists():
            return Response(
                {"detail": "Owner profile already exists for this user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Handle multipart request with JSON string in 'data' field
        if 'data' in request.data:
            try:
                data = json.loads(request.data['data'])
            except json.JSONDecodeError:
                return Response(
                    {"detail": "Invalid JSON in 'data' field."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        return super().create(request, *args, **kwargs)


# -----------------------------------------------------------
# List all users (admins, owners, customers) for admin only
# -----------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_owners_admins_and_customers(request):
    user = request.user
    if not user.is_superuser:
        return Response(
            {"error": "You do not have permission to access this resource."},
            status=status.HTTP_403_FORBIDDEN,
        )

    users = (
        User.objects.filter(is_superuser=True)
        | User.objects.filter(is_owner=True)
        | User.objects.filter(is_customer=True)
    ).distinct()

    user_list = []
    for u in users:
        if u.is_superuser:
            role = "admin"
        elif getattr(u, "is_owner", False):
            role = "owner"
        elif getattr(u, "is_customer", False):
            role = "customer"
        else:
            role = "user"

        user_data = {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "is_owner": getattr(u, "is_owner", False),
            "is_superuser": u.is_superuser,
            "is_customer": getattr(u, "is_customer", False),
            "role": role,
        }

        if role == "owner":
            owner_profile = getattr(u, "owner_profile", None)
            if owner_profile:
                user_data.update(
                    {
                        "futsal_name": owner_profile.futsal_name,
                        "location": owner_profile.location,
                        # "ground_type": owner_profile.ground_type, # Usually on Ground, not OwnerProfile?
                        # "available_slots": owner_profile.available_time_slots, # Add if defined
                    }
                )

        user_list.append(user_data)

    return Response({"users": user_list}, status=status.HTTP_200_OK)


# -----------------------------------------------------------
# Public API: List all grounds with owner info
# -----------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def all_grounds(request):
    owners = OwnerProfile.objects.select_related("user").prefetch_related(
        "grounds__ground_images"
    )

    owners_list = []
    for owner in owners:
        grounds_data = []
        for ground in owner.grounds.all():
            grounds_data.append(
                {
                    "id": ground.id,
                    "ground_type": ground.get_ground_type_display(),
                    "opening_time": ground.opening_time.strftime("%H:%M"),
                    "closing_time": ground.closing_time.strftime("%H:%M"),
                    "price": ground.price,
                    "available_time_slots": ground.available_time_slots,
                    "images": [img.image.url for img in ground.ground_images.all()],
                }
            )
        owners_list.append(
            {
                "owner_id": owner.id,
                "user_id": owner.user.id,
                "username": owner.user.username,
                "futsal_name": owner.futsal_name,
                "location": owner.location,
                "grounds": grounds_data,
            }
        )

    return Response({"owners": owners_list})


# -----------------------------------------------------------
# Ground list/create API
# -----------------------------------------------------------
class GroundListCreateView(generics.ListCreateAPIView):
    queryset = Ground.objects.all()
    serializer_class = GroundSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if not hasattr(self.request.user, "owner_profile"):
            raise serializers.ValidationError("Only owners can create grounds.")
        owner_profile = self.request.user.owner_profile
        serializer.save(owner=owner_profile)


# -----------------------------------------------------------
# Ground retrieve/update/delete API with owner permissions
# -----------------------------------------------------------
class GroundRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ground.objects.all()
    serializer_class = GroundSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_owner:
            return Ground.objects.filter(owner__user=user)
        return Ground.objects.none()


# -----------------------------------------------------------
# Custom permission to allow only owners to modify their grounds
# -----------------------------------------------------------
class IsOwnerPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        owner_profile = OwnerProfile.objects.filter(user=request.user).first()
        return obj.owner == owner_profile


# -----------------------------------------------------------
# OwnerGroundViewSet for CRUD operations on Grounds by owner
# -----------------------------------------------------------
class OwnerGroundViewSet(viewsets.ModelViewSet):
    serializer_class = GroundSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    def get_queryset(self):
        owner_profile = OwnerProfile.objects.filter(user=self.request.user).first()
        if not owner_profile:
            return Ground.objects.none()
        return Ground.objects.filter(owner=owner_profile)

    def perform_create(self, serializer):
        owner_profile = OwnerProfile.objects.filter(user=self.request.user).first()
        if not owner_profile:
            raise PermissionDenied("You must be an owner to add a ground.")
        serializer.save(owner=owner_profile)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = self.get_serializer(instance).data
        if data.get("use_dynamic_pricing"):
            data["price"] = None
        return Response(data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = self.get_serializer(queryset, many=True).data
        for item in data:
            if item.get("use_dynamic_pricing"):
                item["price"] = None
        return Response(data)



class GroundImageUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, ground_id):
        ground = get_object_or_404(Ground, id=ground_id)
        if ground.owner.user != request.user:
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        images = request.FILES.getlist('image')
        if ground.ground_images.count() + len(images) > 6:
            return Response({"detail": "Max 6 images allowed."}, status=status.HTTP_400_BAD_REQUEST)

        created_images = []
        for img in images:
            created_images.append(GroundImage.objects.create(ground=ground, image=img))

        serializer = GroundImageSerializer(created_images, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class GroundImageDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, ground_id, image_id):  # <-- both params here
        ground = get_object_or_404(Ground, id=ground_id)
        if ground.owner.user != request.user:
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        image = get_object_or_404(GroundImage, id=image_id, ground=ground)
        image.delete()
        return Response({"detail": "Image deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
