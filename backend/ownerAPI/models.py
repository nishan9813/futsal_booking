

from django.db import models
from userAPI.models import CustomUser
from datetime import datetime, timedelta, time
from django.utils.translation import gettext_lazy as _
from location_field.models.plain import PlainLocationField

GROUND_TYPE_CHOICES = [
    ("5A", "5-a-side"),
    ("7A", "7-a-side"),
    ("MAT", "Mat Futsal"),
    ("TURF", "Turf"),
    ("WOOD", "Wooden Floor"),
]

DAYS_OF_WEEK = [
    (0, _("Monday")),
    (1, _("Tuesday")),
    (2, _("Wednesday")),
    (3, _("Thursday")),
    (4, _("Friday")),
    (5, _("Saturday")),
    (6, _("Sunday")),
]

class OwnerProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='owner_profile'
    )
    futsal_name = models.CharField(_("Futsal Name"), max_length=255)
    
    city = models.CharField(_("City"), max_length=255, blank=True, null=True)
    location = PlainLocationField(
        based_fields=['city'],
        zoom=7,
        blank=True,
        null=True,
        verbose_name=_("Location Coordinates"),
    )
    address = models.CharField(_("Address"), max_length=255, blank=True, null=True)
    country = models.CharField(_("Country"), max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.futsal_name} (Owner: {self.user.username})"

    @property
    def latitude(self):
        if self.location:
            return self.location.split(',')[0]
        return None

    @property
    def longitude(self):
        if self.location:
            return self.location.split(',')[1]
        return None

class Ground(models.Model):
    owner = models.ForeignKey(
        OwnerProfile, 
        on_delete=models.CASCADE, 
        related_name='grounds'
    )
    name = models.CharField(_("Ground Name"), max_length=100, blank=True)
    ground_type = models.CharField(
        _("Ground Type"), 
        max_length=10, 
        choices=GROUND_TYPE_CHOICES
    )
    opening_time = models.TimeField(_("Opening Time"), default=time(5, 0))
    closing_time = models.TimeField(_("Closing Time"), default=time(22, 0))
    price = models.IntegerField(_("Base Price"), default=0)
    use_dynamic_pricing = models.BooleanField(_("Use Dynamic Pricing"), default=False)

    def __str__(self):
        return f"{self.name or self.ground_type} - {self.owner.futsal_name}"

    # @property
    # def available_time_slots(self):
    #     slots = []
    #     start_dt = datetime.combine(datetime.today(), self.opening_time)
    #     end_dt = datetime.combine(datetime.today(), self.closing_time)
        
    #     while start_dt < end_dt:
    #         next_dt = start_dt + timedelta(hours=1)
    #         slots.append((start_dt.time(), next_dt.time()))
    #         start_dt = next_dt
            
    #     return slots



    @property
    def available_time_slots(self):
        slots = []
        start_dt = datetime.combine(datetime.today(), self.opening_time)
        end_dt = datetime.combine(datetime.today(), self.closing_time)

        while start_dt < end_dt:
            next_dt = start_dt + timedelta(hours=1)
            # Format times as HH:MM - HH:MM strings (no seconds)
            slot_str = f"{start_dt.strftime('%H:%M')} - {next_dt.strftime('%H:%M')}"
            slots.append(slot_str)
            start_dt = next_dt

        return slots


class GroundImage(models.Model):
    ground = models.ForeignKey(
        Ground, 
        on_delete=models.CASCADE, 
        related_name='ground_images'
    )
    image = models.ImageField(_("Image"), upload_to='ground_images/')
    uploaded_at = models.DateTimeField(_("Uploaded At"), auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.pk and self.ground.ground_images.count() >= 6:
            raise ValueError(_("Maximum 6 images allowed per ground."))
        super().save(*args, **kwargs)

class GroundPricing(models.Model):
    ground = models.ForeignKey(
        Ground, 
        on_delete=models.CASCADE, 
        related_name='pricing_rules'
    )
    day_of_week = models.IntegerField(_("Day of Week"), choices=DAYS_OF_WEEK)
    start_time = models.TimeField(_("Start Time"))
    end_time = models.TimeField(_("End Time"))
    price_per_hour = models.PositiveIntegerField(_("Price per Hour"))

    class Meta:
        unique_together = ('ground', 'day_of_week', 'start_time', 'end_time')
        ordering = ['ground', 'day_of_week', 'start_time']
        verbose_name = _("Ground Pricing")
        verbose_name_plural = _("Ground Pricing Rules")

    def __str__(self):
        return f"{self.ground} | {self.get_day_of_week_display()} {self.start_time}-{self.end_time} @ ₹{self.price_per_hour}"

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValueError(_("Start time must be before end time."))
