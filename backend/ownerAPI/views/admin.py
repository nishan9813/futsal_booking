from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from ..models import OwnerProfile
from rest_framework.permissions import AllowAny
User = get_user_model()

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_owners_admins_and_customers(request):
    if not request.user.is_superuser:
        return Response(
            {"error": "You do not have permission."},
            status=403,
        )

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
