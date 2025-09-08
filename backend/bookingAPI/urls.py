# bookingAPI/urls.py
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, GroundTimeSlotsView, BookedTimeSlotsView, OwnerBookingHistoryView, UserBookingsView, CancelBookingView, GroundsByOwnerView

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = router.urls + [
    path('grounds/<int:ground_id>/time-slots/', GroundTimeSlotsView.as_view(), name='ground-time-slots'),
    path('booked-slots/', BookedTimeSlotsView.as_view(), name='booked-time-slots'),
    path('user-history/', UserBookingsView.as_view(), name='user-booking-history'),
    path('owner-history/', OwnerBookingHistoryView.as_view(), name='owner-history'),
    path('owner/bookings/<int:id>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),
    path('grounds/owner/<int:owner_id>/', GroundsByOwnerView.as_view(), name='grounds-by-owner'),

]

