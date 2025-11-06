# # bookingAPI/utils.py
# from django.utils import timezone
# from datetime import timedelta
# from .models import Booking

# def cancel_pending_bookings():
#     """
#     Cancel bookings that are pending for more than 10 minutes
#     """
#     expiry = timezone.now() - timedelta(minutes=10)
#     expired = Booking.objects.filter(status='pending', created_at__lt=expiry)
#     for b in expired:
#         b.status = 'cancelled'
#         b.save()
