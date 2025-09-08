from ..models import OwnerProfile

def get_owner_profile(user):
    """Return OwnerProfile if user is an owner, else None."""
    return getattr(user, 'owner_profile', None)
