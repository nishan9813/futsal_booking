# from django.urls import path, include
# from .views import BookingViewSet
# urlpatterns = [
#     path('booking/',BookingViewSet.as_view(), name="booking"),
# ]


# bookingAPI/urls.py
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, ground_time_slots, booked_time_slots

router = DefaultRouter()
router.register(r'booking', BookingViewSet, basename='booking')

urlpatterns = router.urls + [
    path('grounds/<int:ground_id>/time-slots/', ground_time_slots, name='ground-time-slots'),
    path('booking/booked-slots/', booked_time_slots, name='booked-time-slots'),

]
