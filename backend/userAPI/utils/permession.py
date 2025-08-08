# utils/permissions.py

def get_user_role(user):
    if user.is_superuser:
        return 'admin'
    elif hasattr(user, 'is_owner') and user.is_owner:
        return 'owner'
    elif hasattr(user, 'is_customer') and user.is_customer:
        return 'customer'
    else:
        return 'unknown'
