import logging

from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import serializers 
from .models import OwnerProfile, Ground
from .serializers import OwnerProfileSerializer, GroundSerializer  


logger = logging.getLogger(__name__)
User = get_user_model()


# -----------------------------------------------------------
# Owner Registration View
# -----------------------------------------------------------
# class RegisterOwnerView(generics.CreateAPIView):
#     serializer_class = OwnerProfileSerializer
#     permission_classes = [AllowAny]
#     parser_classes = [MultiPartParser, FormParser, JSONParser]  # Add JSONParser here

#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         context.update({"request": self.request})
#         return context

from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import OwnerProfile
from .serializers import OwnerProfileSerializer

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .serializers import OwnerProfileSerializer
from .models import OwnerProfile
import json


class RegisterOwnerView(generics.CreateAPIView):
    serializer_class = OwnerProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

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

        # Check if 'data' JSON string present (our frontend will send JSON string in 'data')
        if 'data' in request.data:
            try:
                data = json.loads(request.data['data'])
            except json.JSONDecodeError:
                return Response({"detail": "Invalid JSON in 'data' field."}, status=400)

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        return super().create(request, *args, **kwargs)




@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_owners_admins_and_customers(request):
    user = request.user

    if not user.is_superuser:
        return Response(
            {"error": "You do not have permission to access this resource."},
            status=status.HTTP_403_FORBIDDEN
        )

    # Fetch all users who are admin, owner or customer
    users = User.objects.filter(
        is_superuser=True
    ) | User.objects.filter(
        is_owner=True
    ) | User.objects.filter(
        is_customer=True
    )

    # Remove duplicates using distinct()
    users = users.distinct()

    user_list = []
    for u in users:
        # Determine role explicitly
        if u.is_superuser:
            role = "admin"
        elif getattr(u, "is_owner", False):
            role = "owner"
        elif getattr(u, "is_customer", False):
            role = "customer"
        else:
            role = "user"  # fallback if needed

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

        # Add extra fields if owner
        if role == "owner":
            owner_profile = getattr(u, "owner_profile", None)
            if owner_profile:
                user_data.update({
                    "futsal_name": owner_profile.futsal_name,
                    "location": owner_profile.location,
                    "ground_type": owner_profile.ground_type,
                    "available_slots": owner_profile.available_time_slots,
                })

        user_list.append(user_data)

    return Response({"users": user_list}, status=status.HTTP_200_OK)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated  # or AllowAny if public
from rest_framework.response import Response
from .models import OwnerProfile

@api_view(["GET"])
@permission_classes([AllowAny])  # Allow unauthenticated access
def all_grounds(request):
    # Fetch all owner profiles, prefetch related grounds and ground images for efficiency
    owners = OwnerProfile.objects.select_related('user').prefetch_related('grounds__ground_images').all()

    owners_list = []

    for owner in owners:
        grounds_data = []
        for ground in owner.grounds.all():
            grounds_data.append({
                "id": ground.id,
                "ground_type": ground.get_ground_type_display(),
                "opening_time": ground.opening_time.strftime("%H:%M"),
                "closing_time": ground.closing_time.strftime("%H:%M"),
                "price": ground.price,
                "available_time_slots": ground.available_time_slots,
                # "image_count": ground.image_count,
                "images": [img.image.url for img in ground.ground_images.all()]
            })

        owner_data = {
            "owner_id": owner.id,
            "user_id": owner.user.id,
            "username": owner.user.username,
            "futsal_name": owner.futsal_name,
            "location": owner.location,
            "grounds": grounds_data,
        }

        owners_list.append(owner_data)

    return Response({"owners": owners_list})


class GroundListCreateView(generics.ListCreateAPIView):
    """
    API view to list all grounds and create a new ground.

    - GET: Lists all grounds. This can be accessed by any user.
    - POST: Creates a new ground. Only an authenticated owner can create a ground.
            The ground will be automatically linked to the logged-in owner's profile.
    """
    queryset = Ground.objects.all()
    serializer_class = GroundSerializer

    # Permission is set to IsAuthenticated for creating, but you can adjust
    # this for listing grounds if you want to allow anonymous access.
    # To enforce that only owners can create, you might need a custom permission class.
    # For now, we'll rely on the perform_create method to handle the owner check.
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """
        Custom method to handle object creation.
        It automatically links the new ground to the logged-in owner's profile.
        """
        # Ensure the user is an owner before allowing ground creation
        if not hasattr(self.request.user, 'owner_profile'):
            raise serializers.ValidationError("Only owners can create grounds.")

        owner_profile = self.request.user.owner_profile
        serializer.save(owner=owner_profile)


class GroundRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete a single ground.

    - GET: Retrieve a single ground by ID.
    - PUT/PATCH: Update a single ground.
    - DELETE: Delete a single ground.
    
    Permissions are set to ensure only the owner of the ground can modify or delete it.
    """
    queryset = Ground.objects.all()
    serializer_class = GroundSerializer
    permission_classes = [IsAuthenticated]  # Or a custom permission class

    def get_queryset(self):
        """
        Ensure users can only update or delete their own grounds.
        """
        user = self.request.user
        if user.is_owner:
            return Ground.objects.filter(owner__user=user)
        return Ground.objects.none() # Non-owners cannot access this view
    








# from rest_framework import viewsets, permissions
# from rest_framework.exceptions import PermissionDenied
# from .models import GroundPricing
# # from .serializers import GroundPricingSerializer

# class GroundPricingViewSet(viewsets.ModelViewSet):
#     queryset = GroundPricing.objects.all()
#     serializer_class = GroundPricingSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         # Only allow owners to see their own ground pricing rules
#         return GroundPricing.objects.filter(ground__owner__user=user)

#     def perform_create(self, serializer):
#         user = self.request.user
#         ground = serializer.validated_data['ground']
#         if ground.owner.user != user:
#             raise PermissionDenied("You don't own this ground.")
#         serializer.save()

#     def perform_update(self, serializer):
#         user = self.request.user
#         ground = serializer.validated_data.get('ground', serializer.instance.ground)
#         if ground.owner.user != user:
#             raise PermissionDenied("You don't own this ground.")
#         serializer.save()

#     def perform_destroy(self, instance):
#         user = self.request.user
#         if instance.ground.owner.user != user:
#             raise PermissionDenied("You don't own this ground.")
#         instance.delete()
