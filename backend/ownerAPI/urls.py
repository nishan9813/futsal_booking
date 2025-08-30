from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterOwnerView,
    list_owners_admins_and_customers,
    all_grounds,
    GroundListCreateView,
    GroundRetrieveUpdateDestroyView,
    OwnerGroundViewSet,
    GroundImageUploadView,
    GroundImageDeleteView,
    GroundDistanceView
)

router = DefaultRouter()
router.register(r'ownerground', OwnerGroundViewSet, basename='owner-grounds')
# router.register(r'distance', GroundDistanceView, basename='distance-grounds')


urlpatterns = [
    path('register-owner/', RegisterOwnerView.as_view(), name='register-owner'),
    path('all-users/', list_owners_admins_and_customers, name='list-owners-admins'),
    path('grounds/', all_grounds, name='grounds'),
    path('grounds_test/', GroundListCreateView.as_view(), name='ground-list-create'),
    path('grounds_test/<int:pk>/', GroundRetrieveUpdateDestroyView.as_view(), name='ground-detail'),
    path('ground/<int:ground_id>/upload-image/', GroundImageUploadView.as_view(), name='ground-image-upload'),
    path('ground/<int:ground_id>/delete-image/<int:image_id>/', GroundImageDeleteView.as_view(), name='ground-image-delete'),
    path("distance/", GroundDistanceView.as_view(), name="GroundToUser"),

    path('', include(router.urls)),  # Now OwnerGroundViewSet is included here
]
