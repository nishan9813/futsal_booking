# from django.urls import path, include
# from .views import BookingViewSet
# urlpatterns = [
#     path('booking/',BookingViewSet.as_view(), name="booking"),
# ]


# bookingAPI/urls.py
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet

router = DefaultRouter()
router.register(r'booking', BookingViewSet, basename='booking')

urlpatterns = router.urls
