from rest_framework.permissions import BasePermission

def get_user_role(user):
    if not user.is_authenticated:
        return None

    if user.is_superuser or getattr(user, 'is_admin', False):
        return 'admin'
    if getattr(user, 'is_owner', False):
        return 'owner'
    if getattr(user, 'is_customer', False):
        return 'customer'
    return 'user'

class IsOwner(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and get_user_role(user) == 'owner'

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and get_user_role(user) == 'admin'

class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and get_user_role(user) == 'customer'

class IsAdminOrCustomer(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and get_user_role(user) in ['admin', 'customer']
