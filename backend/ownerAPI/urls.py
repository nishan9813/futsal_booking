from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterOwnerView, list_owners_admins_and_customers, all_grounds, GroundListCreateView, GroundRetrieveUpdateDestroyView

router = DefaultRouter()
# router.register(r'ground-pricing', GroundPricingViewSet, basename='ground-pricing')

urlpatterns = [
    path('register-owner/', RegisterOwnerView.as_view(), name='register-owner'),
    path('all-users/', list_owners_admins_and_customers, name='list-owners-admins'),
    path('grounds/', all_grounds, name='grounds'),
    path('grounds_test/', GroundListCreateView.as_view(), name='ground-list-create'),
    path('grounds_test/<int:pk>/', GroundRetrieveUpdateDestroyView.as_view(), name='ground-detail'),

    path('', include(router.urls)),  # Include all viewset routes here
]
