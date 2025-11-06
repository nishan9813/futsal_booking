# from django.shortcuts import get_object_or_404
# from rest_framework import viewsets, permissions, filters, status, serializers
# from rest_framework.views import APIView
# from rest_framework.parsers import MultiPartParser
# from rest_framework.response import Response
# from rest_framework.exceptions import PermissionDenied
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import BasePermission, IsAuthenticated, AllowAny

# from ..models import Ground, GroundImage, OwnerProfile
# from ..serializers import GroundSerializer, GroundImageSerializer
# from userAPI.permessions import IsAdmin


# # ---------------------------
# # Custom Permission
# # ---------------------------
# class IsOwnerPermission(BasePermission):
#     """
#     Object-level permission to allow only owners to access their grounds.
#     """
#     def has_object_permission(self, request, view, obj):
#         owner_profile = OwnerProfile.objects.filter(user=request.user).first()
#         return obj.owner == owner_profile


# # ---------------------------
# # Ground CRUD for Owners
# # ---------------------------
# class OwnerGroundViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for authenticated owners to perform CRUD on their own grounds.
#     """
#     serializer_class = GroundSerializer
#     permission_classes = [IsAuthenticated, IsOwnerPermission, IsAdmin]
#     filter_backends = [filters.SearchFilter]
#     search_fields = ['futsal_name']

#     def get_queryset(self):
#         owner_profile = OwnerProfile.objects.filter(user=self.request.user).first()
#         if not owner_profile:
#             return Ground.objects.none()
#         return Ground.objects.filter(owner=owner_profile)

#     def perform_create(self, serializer):
#         owner_profile = OwnerProfile.objects.filter(user=self.request.user).first()
#         if not owner_profile:
#             raise PermissionDenied("You must be an owner to add a ground.")
#         serializer.save(owner=owner_profile)

#     def retrieve(self, request, *args, **kwargs):
#         instance = self.get_object()
#         data = self.get_serializer(instance).data
#         if data.get("use_dynamic_pricing"):
#             data["price"] = None
#         return Response(data)

#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         data = self.get_serializer(queryset, many=True).data
#         for item in data:
#             if item.get("use_dynamic_pricing"):
#                 item["price"] = None
#         return Response(data)


# # ---------------------------
# # Ground Image Upload/Delete
# # ---------------------------
# class GroundImageUploadView(APIView):
#     parser_classes = [MultiPartParser]
#     permission_classes = [IsAuthenticated, IsAdmin]

#     def post(self, request, ground_id):
#         ground = get_object_or_404(Ground, id=ground_id)

#         if ground.owner.user != request.user:
#             return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

#         images = request.FILES.getlist('image')
#         if ground.ground_images.count() + len(images) > 6:
#             return Response({"detail": "Max 6 images allowed."}, status=status.HTTP_400_BAD_REQUEST)

#         created_images = [GroundImage.objects.create(ground=ground, image=img) for img in images]

#         serializer = GroundImageSerializer(created_images, many=True, context={"request": request})
#         return Response(serializer.data, status=status.HTTP_201_CREATED)


# class GroundImageDeleteView(APIView):
#     permission_classes = [IsAuthenticated, IsAdmin]

#     def delete(self, request, ground_id, image_id):
#         ground = get_object_or_404(Ground, id=ground_id)
#         if ground.owner.user != request.user:
#             return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

#         image = get_object_or_404(GroundImage, id=image_id, ground=ground)
#         image.delete()
#         return Response({"detail": "Image deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# # ---------------------------
# # List all grounds (Public)
# # ---------------------------
# @api_view(["GET"])
# @permission_classes([AllowAny])
# def all_grounds(request):
#     owners = OwnerProfile.objects.select_related("user").prefetch_related("grounds__ground_images")
#     owners_list = []

#     for owner in owners:
#         grounds_data = []
#         for ground in owner.grounds.all():
#             grounds_data.append({
#                 "id": ground.id,
#                 "name": ground.name,  # <-- add this
#                 "ground_type": ground.get_ground_type_display(),
#                 "opening_time": ground.opening_time.strftime("%H:%M"),
#                 "closing_time": ground.closing_time.strftime("%H:%M"),
#                 "price": ground.price,
#                 "address": owner.address,
#                 "city": owner.city,
#                 "available_time_slots": ground.available_time_slots,
#                 "images": [img.image.url for img in ground.ground_images.all()],
#             })
#         owners_list.append({
#             "owner_id": owner.id,
#             "user_id": owner.user.id,
#             "username": owner.user.username,
#             "futsal_name": owner.futsal_name,
#             "location": owner.location,
#             "grounds": grounds_data,
#         })

#     return Response({"owners": owners_list})


from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, filters, status, serializers
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission, IsAuthenticated, AllowAny

from ..models import Ground, GroundImage, OwnerProfile
from ..serializers import GroundSerializer, GroundImageSerializer
from userAPI.permessions import IsAdminOrOwner, IsAdminOrOwnerPermission, get_user_role  # Add this import
  # Import the new permissions


# ---------------------------
# Ground CRUD for Owners & Admins
# ---------------------------
class OwnerGroundViewSet(viewsets.ModelViewSet):
    """
    ViewSet for authenticated owners/admins to perform CRUD on grounds.
    """
    serializer_class = GroundSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]  # Use the new combined permission
    filter_backends = [filters.SearchFilter]
    search_fields = ['futsal_name']

    def get_queryset(self):
        user_role = get_user_role(self.request.user)
        
        # Admin can see ALL grounds
        if user_role == 'admin':
            return Ground.objects.all()
        
        # Owner can only see their own grounds
        owner_profile = OwnerProfile.objects.filter(user=self.request.user).first()
        if not owner_profile:
            return Ground.objects.none()
        return Ground.objects.filter(owner=owner_profile)

    def perform_create(self, serializer):
        user_role = get_user_role(self.request.user)
        
        if user_role == 'admin':
            # Admin can create grounds for any owner (if owner_id provided)
            owner_id = self.request.data.get('owner')
            if owner_id:
                owner_profile = get_object_or_404(OwnerProfile, id=owner_id)
                serializer.save(owner=owner_profile)
            else:
                # If no owner specified, create for current user (if they're an owner)
                owner_profile = OwnerProfile.objects.filter(user=self.request.user).first()
                if owner_profile:
                    serializer.save(owner=owner_profile)
                else:
                    raise PermissionDenied("Owner profile not found or you don't have permission.")
        else:
            # Regular owner can only create for themselves
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


# ---------------------------
# Ground Image Upload/Delete (Updated for Admins & Owners)
# ---------------------------
class GroundImageUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerPermission]  # Use simplified permission

    def post(self, request, ground_id):
        ground = get_object_or_404(Ground, id=ground_id)
        user_role = get_user_role(request.user)

        # Check permission: admin can access any ground, owner only their own
        if user_role == 'owner' and ground.owner.user != request.user:
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        images = request.FILES.getlist('image')
        if ground.ground_images.count() + len(images) > 6:
            return Response({"detail": "Max 6 images allowed."}, status=status.HTTP_400_BAD_REQUEST)

        created_images = [GroundImage.objects.create(ground=ground, image=img) for img in images]
        serializer = GroundImageSerializer(created_images, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GroundImageDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrOwnerPermission]  # Use simplified permission

    def delete(self, request, ground_id, image_id):
        ground = get_object_or_404(Ground, id=ground_id)
        user_role = get_user_role(request.user)
        
        # Check permission: admin can access any ground, owner only their own
        if user_role == 'owner' and ground.owner.user != request.user:
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        image = get_object_or_404(GroundImage, id=image_id, ground=ground)
        image.delete()
        return Response({"detail": "Image deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# ---------------------------
# List all grounds (Public) - Unchanged
# ---------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def all_grounds(request):
    owners = OwnerProfile.objects.select_related("user").prefetch_related("grounds__ground_images")
    owners_list = []

    for owner in owners:
        grounds_data = []
        for ground in owner.grounds.all():
            grounds_data.append({
                "id": ground.id,
                "name": ground.name,
                "ground_type": ground.get_ground_type_display(),
                "opening_time": ground.opening_time.strftime("%H:%M"),
                "closing_time": ground.closing_time.strftime("%H:%M"),
                "price": ground.price,
                "address": owner.address,
                "city": owner.city,
                "available_time_slots": ground.available_time_slots,
                "images": [img.image.url for img in ground.ground_images.all()],
            })
        owners_list.append({
            "owner_id": owner.id,
            "user_id": owner.user.id,
            "username": owner.user.username,
            "futsal_name": owner.futsal_name,
            "location": owner.location,
            "grounds": grounds_data,
        })

    return Response({"owners": owners_list})