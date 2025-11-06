# # bookingAPI/urls.py
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     BookingViewSet,
#     GroundTimeSlotsView,
#     BookedTimeSlotsView,
#     OwnerBookingHistoryView,
#     UserBookingsView,
#     CancelBookingView,
#     GroundsByOwnerView,
#     get_ground_price,
#     get_demo_accounts,
#     reset_demo_accounts
# )

# router = DefaultRouter()
# router.register(r'bookings', BookingViewSet, basename='booking')

# urlpatterns = [
#     path('', include(router.urls)),  # Remove 'api/' here
    
#     # All other endpoints without duplicate /api/ prefix
#     path('grounds/<int:pk>/time-slots/', GroundTimeSlotsView.as_view(), name='ground-time-slots'),
#     path('booked-slots/', BookedTimeSlotsView.as_view(), name='booked-time-slots'),
#     path('user-history/', UserBookingsView.as_view(), name='user-booking-history'),
#     path('owner-history/', OwnerBookingHistoryView.as_view(), name='owner-booking-history'),
#     path('bookings/<int:id>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),
#     path('grounds/owner/<int:owner_id>/', GroundsByOwnerView.as_view(), name='grounds-by-owner'),
#     path('ground-price/', get_ground_price, name='ground-price'),
#     path('demo-accounts/', get_demo_accounts, name='demo-accounts'),
#     path('reset-demo-accounts/', reset_demo_accounts, name='reset-demo-accounts'),
# ]



# bookingAPI/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BookingViewSet,
    GroundTimeSlotsView,
    BookedTimeSlotsView,
    OwnerBookingHistoryView,
    UserBookingsView,
    CancelBookingView,
    GroundsByOwnerView,
    get_ground_price,
    get_demo_accounts,
    reset_demo_accounts
)

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    
    # All other endpoints without duplicate /api/ prefix
    path('grounds/<int:pk>/time-slots/', GroundTimeSlotsView.as_view(), name='ground-time-slots'),
    path('booked-slots/', BookedTimeSlotsView.as_view(), name='booked-time-slots'),
    path('user-history/', UserBookingsView.as_view(), name='user-booking-history'),
    path('owner-history/', OwnerBookingHistoryView.as_view(), name='owner-booking-history'),
    path('bookings/<int:id>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),
    path('grounds/owner/<int:owner_id>/', GroundsByOwnerView.as_view(), name='grounds-by-owner'),
    path('ground-price/', get_ground_price, name='ground-price'),
    path('demo-accounts/', get_demo_accounts, name='demo-accounts'),
    path('reset-demo-accounts/', reset_demo_accounts, name='reset-demo-accounts'),
]