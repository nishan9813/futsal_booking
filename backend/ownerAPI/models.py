
from django.db import models
from userAPI.models import CustomUser
from datetime import datetime, timedelta, time
from django.utils.translation import gettext_lazy as _
from location_field.models.plain import PlainLocationField
from .utils.dynamicPricing import calculate_dynamic_price

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

# -------------------- Owner --------------------
class OwnerProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="owner_profile"
    )
    futsal_name = models.CharField(_("Futsal Name"), max_length=255)
    city = models.CharField(_("City"), max_length=255, blank=True, null=True)
    location = PlainLocationField(
        based_fields=["city"],
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
            return self.location.split(",")[0]
        return None

    @property
    def longitude(self):
        if self.location:
            return self.location.split(",")[1]
        return None


# -------------------- Ground --------------------
class Ground(models.Model):
    owner = models.ForeignKey(
        OwnerProfile,
        on_delete=models.CASCADE,
        related_name="grounds"
    )
    name = models.CharField(_("Ground Name"), max_length=100, blank=True)  # auto-assigned
    ground_type = models.CharField(
        _("Ground Type"),
        max_length=10,
        choices=GROUND_TYPE_CHOICES
    )
    opening_time = models.TimeField(_("Opening Time"), default=time(5, 0))
    closing_time = models.TimeField(_("Closing Time"), default=time(22, 0))
    price = models.IntegerField(_("Base Price"), default=0)
    use_dynamic_pricing = models.BooleanField(_("Use Dynamic Pricing"), default=False)

    def save(self, *args, **kwargs):
        # Auto-assign name if not provided
        if not self.name:
            existing_count = Ground.objects.filter(owner=self.owner).count()
            self.name = f"Ground {existing_count + 1}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.owner.futsal_name}"

    @property
    def available_time_slots(self):
        slots = []
        start_dt = datetime.combine(datetime.today(), self.opening_time)
        end_dt = datetime.combine(datetime.today(), self.closing_time)

        while start_dt < end_dt:
            next_dt = start_dt + timedelta(hours=1)
            slot_str = f"{start_dt.strftime('%H:%M')} - {next_dt.strftime('%H:%M')}"
            slots.append(slot_str)
            start_dt = next_dt

        return slots

    def get_price_for_slot(self, slot: str, recent_booking_count: int = 0):
        """
        Returns either base or dynamic price for a given slot.
        """
        try:
            start_str = slot.split("-")[0].strip()
            booking_time = datetime.strptime(start_str, "%H:%M")
        except Exception:
            booking_time = datetime.now()

        return calculate_dynamic_price(
            ground=self,
            booking_datetime=booking_time,
            recent_booking_count=recent_booking_count
        )


# -------------------- Ground Images --------------------
class GroundImage(models.Model):
    ground = models.ForeignKey(
        Ground,
        on_delete=models.CASCADE,
        related_name="ground_images"
    )
    image = models.ImageField(_("Image"), upload_to="ground_images/")
    uploaded_at = models.DateTimeField(_("Uploaded At"), auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.pk and self.ground.ground_images.count() >= 6:
            raise ValueError(_("Maximum 6 images allowed per ground."))
        super().save(*args, **kwargs)
