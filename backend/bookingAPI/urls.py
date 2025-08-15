# bookingAPI/urls.py
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, ground_time_slots, booked_time_slots, owner_booking_history, user_booking_history, cancel_booking, grounds_by_owner

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = router.urls + [
    path('grounds/<int:ground_id>/time-slots/', ground_time_slots, name='ground-time-slots'),
    path('booked-slots/', booked_time_slots, name='booked-time-slots'),
    path('user-history/', user_booking_history, name='user-booking-history'),
    path('owner-history/', owner_booking_history, name='owner-history'),
    path('owner/bookings/<int:booking_id>/cancel/', cancel_booking, name='cancel-booking'),
    path('grounds/owner/<int:owner_id>/', grounds_by_owner, name='grounds-by-owner'),

]

