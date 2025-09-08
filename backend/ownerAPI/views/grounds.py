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


# ---------------------------
# Custom Permission
# ---------------------------
class IsOwnerPermission(BasePermission):
    """
    Object-level permission to allow only owners to access their grounds.
    """
    def has_object_permission(self, request, view, obj):
        owner_profile = OwnerProfile.objects.filter(user=request.user).first()
        return obj.owner == owner_profile


# ---------------------------
# Ground CRUD for Owners
# ---------------------------
class OwnerGroundViewSet(viewsets.ModelViewSet):
    """
    ViewSet for authenticated owners to perform CRUD on their own grounds.
    """
    serializer_class = GroundSerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]
    filter_backends = [filters.SearchFilter]
    search_fields = ['futsal_name']

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


# ---------------------------
# Ground Image Upload/Delete
# ---------------------------
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

        created_images = [GroundImage.objects.create(ground=ground, image=img) for img in images]

        serializer = GroundImageSerializer(created_images, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GroundImageDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, ground_id, image_id):
        ground = get_object_or_404(Ground, id=ground_id)
        if ground.owner.user != request.user:
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        image = get_object_or_404(GroundImage, id=image_id, ground=ground)
        image.delete()
        return Response({"detail": "Image deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# ---------------------------
# List all grounds (Public)
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
