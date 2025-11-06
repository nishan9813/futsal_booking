from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from ..models import OwnerProfile
from userAPI.permessions import IsAdmin  # Make sure to import your IsAdmin permission

User = get_user_model()

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from ..models import OwnerProfile
from ..serializers import OwnerProfileSerializer
from userAPI.permessions import IsAdmin

User = get_user_model()

class AdminOwnerViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for full CRUD operations on owners
    """
    serializer_class = OwnerProfileSerializer
    permission_classes = [IsAdmin]
    queryset = OwnerProfile.objects.select_related('user').prefetch_related('grounds')
    
    def list(self, request, *args, **kwargs):
        """
        Custom list to return data in the format your frontend expects
        """
        queryset = self.get_queryset()
        
        owners_data = []
        for owner in queryset:
            owners_data.append({
                "id": owner.id,
                "futsal_name": owner.futsal_name,
                "location": owner.location,
                "city": owner.city,
                "address": owner.address,
                "total_grounds": owner.grounds.count(),
                "user_info": {
                    "id": owner.user.id,
                    "username": owner.user.username,
                    "email": owner.user.email,
                    "first_name": owner.user.first_name,
                    "last_name": owner.user.last_name,
                }
            })
        
        return Response(owners_data)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate owner account"""
        owner = self.get_object()
        owner.user.is_active = True
        owner.user.save()
        return Response({"status": "owner activated"})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate owner account"""
        owner = self.get_object()
        owner.user.is_active = False
        owner.user.save()
        return Response({"status": "owner deactivated"})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get owner statistics"""
        total_owners = self.get_queryset().count()
        total_grounds = sum(owner.grounds.count() for owner in self.get_queryset())
        cities_count = self.get_queryset().values('city').distinct().count()
        
        return Response({
            "total_owners": total_owners,
            "total_grounds": total_grounds,
            "cities_count": cities_count,
            "avg_grounds_per_owner": total_grounds / total_owners if total_owners > 0 else 0
        })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_owners_admins_and_customers(request):
    if not request.user.is_superuser:
        return Response(
            {"error": "You do not have permission."},
            status=403,
        )

    # Check if it's an owners-only request (from your frontend)
    owners_only = request.GET.get('owners_only', False)
    
    if owners_only:
        # Return only owners with detailed info for the admin panel
        owners = OwnerProfile.objects.select_related('user').prefetch_related('grounds')
        owners_data = []
        for owner in owners:
            owners_data.append({
                "id": owner.id,
                "futsal_name": owner.futsal_name,
                "location": owner.location,
                "city": owner.city,
                "address": owner.address,
                "total_grounds": owner.grounds.count(),
                "user_info": {
                    "id": owner.user.id,
                    "username": owner.user.username,
                    "email": owner.user.email,
                    "first_name": owner.user.first_name,
                    "last_name": owner.user.last_name,
                }
            })
        return Response(owners_data)

    # Original logic for all users
    users = (
        User.objects.filter(is_superuser=True)
        | User.objects.filter(is_owner=True)
        | User.objects.filter(is_customer=True)
    ).distinct()

    result = []
    for u in users:
        role = "admin" if u.is_superuser else "owner" if getattr(u, "is_owner", False) else "customer"
        data = {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": role,
            "is_owner": getattr(u, "is_owner", False),
            "is_superuser": u.is_superuser,
            "is_customer": getattr(u, "is_customer", False),
        }
        if role == "owner":
            profile = getattr(u, "owner_profile", None)
            if profile:
                data.update({
                    "futsal_name": profile.futsal_name,
                    "location": profile.location,
                })
        result.append(data)

    return Response({"users": result})


# In views/admin.py - Add this function
@api_view(['GET'])
@permission_classes([IsAdmin])
def owner_stats(request):
    """Get owner statistics"""
    owners = OwnerProfile.objects.select_related('user').prefetch_related('grounds')
    
    total_owners = owners.count()
    total_grounds = sum(owner.grounds.count() for owner in owners)
    cities_count = owners.values('city').distinct().count()
    
    return Response({
        "total_owners": total_owners,
        "total_grounds": total_grounds,
        "cities_count": cities_count,
        "avg_grounds_per_owner": total_grounds / total_owners if total_owners > 0 else 0
    })