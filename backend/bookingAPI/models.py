from django.db import models
from django.core.exceptions import ValidationError
from userAPI.models import CustomUser
from ownerAPI.models import OwnerProfile
import datetime

class Booking(models.Model):
    STATUS_CHOICES = [
        ('booked', 'Booked'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bookings')
    ground = models.ForeignKey(OwnerProfile, on_delete=models.CASCADE, related_name='bookings')
    booking_date = models.DateField()
    time_slot = models.CharField(max_length=20)  # Format: "HH:MM - HH:MM"
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='booked')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking for {self.ground.futsal_name} on {self.booking_date} at {self.time_slot} by {self.user.username}"

    def clean(self):
        # Prevent past date booking
        if self.booking_date < datetime.date.today():
            raise ValidationError("Booking date cannot be in the past.")

        # Normalize time_slot formatting
        self.time_slot = self.time_slot.strip().replace('–', '-').replace(' - ', '-').replace('-', ' - ')

        # Check if time_slot is in the ground's available slots
        available_slots = self.ground.available_time_slots
        if self.time_slot not in available_slots:
            raise ValidationError(f"Time slot '{self.time_slot}' is not available. Available slots: {available_slots}")

        # Validate time range format
        try:
            start_str, end_str = self.time_slot.split(' - ')
            start_time = datetime.datetime.strptime(start_str, '%H:%M').time()
            end_time = datetime.datetime.strptime(end_str, '%H:%M').time()
        except ValueError:
            raise ValidationError("time_slot must be in 'HH:MM - HH:MM' format.")

        if start_time >= end_time:
            raise ValidationError("End time must be after start time.")

        # Check for overlapping bookings
        overlapping = Booking.objects.filter(
            ground=self.ground,
            booking_date=self.booking_date,
            time_slot=self.time_slot,
            status='booked'
        )
        if self.pk:
            overlapping = overlapping.exclude(pk=self.pk)

        if overlapping.exists():
            raise ValidationError("This time slot is already booked.")

    def save(self, *args, **kwargs):
        self.full_clean()  # Runs clean() and field validation
        super().save(*args, **kwargs)
