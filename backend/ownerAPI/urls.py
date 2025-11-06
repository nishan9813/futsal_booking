# from django.urls import path, include
# from rest_framework.routers import DefaultRouter

# # Import views
# from .views.owners import RegisterOwnerView
# from .views.admin import list_owners_admins_and_customers
# from .views.grounds import all_grounds, OwnerGroundViewSet, GroundImageUploadView, GroundImageDeleteView
# from .views.groundUtils import GroundDistanceView, GroundPriceSortAPIView

# # DRF router for OwnerGroundViewSet
# router = DefaultRouter()
# router.register(r'owner-grounds', OwnerGroundViewSet, basename='owner-grounds')

# urlpatterns = [
#     # Owner registration
#     path('register-owner/', RegisterOwnerView.as_view(), name='register-owner'),

#     # Admin-only endpoint
#     path('all-users/', list_owners_admins_and_customers, name='list-owners-admins'),

#     # Public grounds listing (if you want a simple function-based endpoint)
#     path('grounds/', all_grounds, name='grounds'),

#     # Ground images endpoints
#     path('ground/<int:ground_id>/upload-image/', GroundImageUploadView.as_view(), name='ground-image-upload'),
#     path('ground/<int:ground_id>/delete-image/<int:image_id>/', GroundImageDeleteView.as_view(), name='ground-image-delete'),

#     # Distance and price sorting endpoints
#     path('distance/', GroundDistanceView.as_view(), name='ground-distance'),
#     path('price-sort/', GroundPriceSortAPIView.as_view(), name='ground-price-sort'),

#     # Include DRF router URLs for OwnerGroundViewSet (list, create, retrieve, update, delete)
#     path('', include(router.urls)),
# ]


# In urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import views
from .views.owners import RegisterOwnerView
from .views.admin import list_owners_admins_and_customers, AdminOwnerViewSet, owner_stats  # Updated import
from .views.grounds import all_grounds, OwnerGroundViewSet, GroundImageUploadView, GroundImageDeleteView
from .views.groundUtils import GroundDistanceView, GroundPriceSortAPIView

# DRF routers
router = DefaultRouter()
router.register(r'owner-grounds', OwnerGroundViewSet, basename='owner-grounds')
router.register(r'admin/owners', AdminOwnerViewSet, basename='admin-owners')  # Add this

urlpatterns = [
    # Owner registration
    path('register-owner/', RegisterOwnerView.as_view(), name='register-owner'),

    # Admin-only endpoints
    path('all-users/', list_owners_admins_and_customers, name='list-owners-admins'),

    # Public grounds listing
    path('grounds/', all_grounds, name='grounds'),

    # Ground images endpoints
    path('ground/<int:ground_id>/upload-image/', GroundImageUploadView.as_view(), name='ground-image-upload'),
    path('ground/<int:ground_id>/delete-image/<int:image_id>/', GroundImageDeleteView.as_view(), name='ground-image-delete'),
    path('admin/owners/stats/', owner_stats, name='admin-owners-stats'),


    # Distance and price sorting endpoints
    path('distance/', GroundDistanceView.as_view(), name='ground-distance'),
    path('price-sort/', GroundPriceSortAPIView.as_view(), name='ground-price-sort'),

    # Include DRF router URLs (includes both owner-grounds and admin/owners)
    path('', include(router.urls)),
]