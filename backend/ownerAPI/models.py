from django.db import models
from userAPI.models import CustomUser
from datetime import datetime, timedelta, time

GROUND_TYPE_CHOICES = [
    ("5A", "5-a-side"),
    ("7A", "7-a-side"),
    ("MAT", "Mat Futsal"),
    ("TURF", "Turf"),
    ("WOOD", "Wooden Floor"),
]

class OwnerProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='owner_profile')
    futsal_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.futsal_name} (Owner: {self.user.username})"


class Ground(models.Model):
    owner = models.ForeignKey(OwnerProfile, on_delete=models.CASCADE, related_name='grounds')
    ground_type = models.CharField(max_length=10, choices=GROUND_TYPE_CHOICES)
    opening_time = models.TimeField(default=time(5, 0))
    closing_time = models.TimeField(default=time(22, 0))
    price = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.ground_type} - {self.owner.futsal_name}"

    @property
    def available_time_slots(self):
        slots = []
        start_dt = datetime.combine(datetime.today(), self.opening_time)
        end_dt = datetime.combine(datetime.today(), self.closing_time)
        while start_dt < end_dt:
            next_dt = start_dt + timedelta(hours=1)
            slots.append(f"{start_dt.strftime('%H:%M')} - {next_dt.strftime('%H:%M')}")
            start_dt = next_dt
        return slots
    @property
    def image_count(self):
        return self.ground_images.count()


class GroundImage(models.Model):
    ground = models.ForeignKey(Ground, on_delete=models.CASCADE, related_name='ground_images')
    image = models.ImageField(upload_to='ground_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.ground} ({self.id})"

    def save(self, *args, **kwargs):
        if not self.pk and self.ground.ground_images.count() >= 6:
            raise ValueError("Maximum 6 images allowed per ground.")
        super().save(*args, **kwargs)
