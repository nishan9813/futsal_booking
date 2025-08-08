from rest_framework.permissions import BasePermission
from .utils.permession import get_user_role  # Make sure the path & filename are correct

class IsOwner(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) == 'owner'

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) == 'admin'

class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) == 'customer'




class IsAdminOrCustomer(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated
            and (getattr(user, 'is_admin', False) or getattr(user, 'is_customer', False))
        )