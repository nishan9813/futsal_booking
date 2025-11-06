# from rest_framework.permissions import BasePermission

# def get_user_role(user):
#     if not user.is_authenticated:
#         return None

#     if user.is_superuser or getattr(user, 'is_admin', False):
#         return 'admin'
#     if getattr(user, 'is_owner', False):
#         return 'owner'
#     if getattr(user, 'is_customer', False):
#         return 'customer'
#     return 'user'

# class IsOwner(BasePermission):
#     def has_permission(self, request, view):
#         user = request.user
#         return user.is_authenticated and get_user_role(user) == 'owner'

# class IsAdmin(BasePermission):
#     def has_permission(self, request, view):
#         user = request.user
#         return user.is_authenticated and get_user_role(user) == 'admin'

# class IsCustomer(BasePermission):
#     def has_permission(self, request, view):
#         user = request.user
#         return user.is_authenticated and get_user_role(user) == 'customer'

# class IsAdminOrCustomer(BasePermission):
#     def has_permission(self, request, view):
#         user = request.user
#         return user.is_authenticated and get_user_role(user) in ['admin', 'customer']


from rest_framework.permissions import BasePermission
from ownerAPI.models import OwnerProfile

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

# NEW COMBINED PERMISSIONS
class IsAdminOrOwner(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and get_user_role(user) in ['admin', 'owner']
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        user_role = get_user_role(user)
        
        # Admin can access any object
        if user_role == 'admin':
            return True
        
        # Owner can only access their own objects
        if user_role == 'owner':
            # For Ground objects, check if owner matches
            if hasattr(obj, 'owner'):
                return obj.owner.user == user
            # For OwnerProfile objects, check if it's their own profile
            elif isinstance(obj, OwnerProfile):
                return obj.user == user
        
        return False

class IsAdminOrOwnerPermission(BasePermission):
    """
    Simplified version for views where we don't have object-level checks
    """
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and get_user_role(user) in ['admin', 'owner']