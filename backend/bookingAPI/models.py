# bookingAPI/models.py
from django.db import models
from django.utils import timezone
from userAPI.models import CustomUser
from ownerAPI.models import Ground
from django.core.exceptions import ValidationError
import datetime
import uuid

# ------------------ BOOKING MODEL ------------------
class Booking(models.Model):
    STATUS_CHOICES = [
        ('booked', 'Booked'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bookings')
    ground = models.ForeignKey(Ground, on_delete=models.CASCADE)
    booking_date = models.DateField()
    time_slot = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='booked')
    created_at = models.DateTimeField(auto_now_add=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        unique_together = ('ground', 'booking_date', 'time_slot')

    def __str__(self):
        return f"{self.ground.ground_type} on {self.booking_date} ({self.time_slot}) by {self.user.username}"

    @property
    def is_paid(self):
        """Check if booking has been paid successfully"""
        latest_payment = getattr(self, "payment", None)
        return latest_payment and latest_payment.status == 'success'

    def get_booking_datetime(self):
        """Get the booking datetime as timezone-aware"""
        slot_start_time = self.time_slot.split('-')[0].strip()
        naive_booking_datetime = datetime.datetime.combine(
            self.booking_date, 
            datetime.datetime.strptime(slot_start_time, '%H:%M').time()
        )
        # Make it timezone-aware
        if timezone.is_naive(naive_booking_datetime):
            return timezone.make_aware(naive_booking_datetime)
        return naive_booking_datetime

    @property
    def can_cancel(self):
        """Check if booking can be cancelled (before start time)"""
        if self.status != 'booked':
            return False
        
        booking_datetime = self.get_booking_datetime()
        return timezone.now() < booking_datetime

    @property
    def is_refund_eligible(self):
        """Check if cancellation is eligible for refund (more than 12 hours before)"""
        if not self.can_cancel:
            return False
        
        booking_datetime = self.get_booking_datetime()
        time_until_booking = booking_datetime - timezone.now()
        return time_until_booking.total_seconds() > 12 * 3600  # 12 hours in seconds

    @property
    def cancellation_deadline(self):
        """Get the cancellation deadline (12 hours before booking)"""
        booking_datetime = self.get_booking_datetime()
        return booking_datetime - datetime.timedelta(hours=12)

    def clean(self):
        """Validate booking data before saving"""
        if self.booking_date < datetime.date.today():
            raise ValidationError("Booking date cannot be in the past.")

        # Normalize time slot format
        self.time_slot = self.time_slot.strip().replace('–', '-').replace(' - ', '-').replace('-', ' - ')

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

    def cancel_booking(self):
        """Cancel the booking using the cancellation service"""
        success, message, refund_amount, booking = BookingCancellationService.process_cancellation(self)
        if not success:
            raise ValidationError(message)
        return refund_amount

    def mark_completed(self):
        """Mark booking as completed"""
        self.status = 'completed'
        self.save()

    def save(self, *args, **kwargs):
        """Override save to include clean validation"""
        self.clean()
        super().save(*args, **kwargs)


# ------------------ PAYMENT MODEL ------------------
class Payment(models.Model):
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refund', 'Refund'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    username = models.CharField(max_length=50)  # Demo payment username
    pin = models.CharField(max_length=10)
    transaction_id = models.CharField(max_length=100, unique=True, default=uuid.uuid4)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='success')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} | {self.transaction_id} | {self.status}"

    def clean(self):
        """Validate payment data"""
        if self.amount <= 0:
            raise ValidationError("Payment amount must be greater than zero.")
        
        # Ensure username and pin are provided for demo payments
        if not self.username or not self.pin:
            raise ValidationError("Payment username and PIN are required.")


# ------------------ DEMO PAYMENT ACCOUNT ------------------
class DemoPaymentAccount(models.Model):
    username = models.CharField(max_length=50, unique=True)
    pin = models.CharField(max_length=10)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=1000)

    def __str__(self):
        return f"{self.username} (Balance: {self.balance})"

    def validate(self, input_pin):
        """Validate the PIN for this account"""
        return self.pin == input_pin

    def charge(self, amount):
        """Charge amount from the account balance"""
        if amount <= 0:
            raise ValidationError("Charge amount must be greater than zero.")
        
        if self.balance >= amount:
            self.balance -= amount
            self.save()
            return True
        return False

    def refund(self, amount):
        """Refund amount to the account balance"""
        if amount <= 0:
            raise ValidationError("Refund amount must be greater than zero.")
        
        self.balance += amount
        self.save()
        return True

    def clean(self):
        """Validate demo account data"""
        if not self.username:
            raise ValidationError("Username is required.")
        
        if not self.pin or len(self.pin) != 4:
            raise ValidationError("PIN must be exactly 4 digits.")
        
        if self.balance < 0:
            raise ValidationError("Balance cannot be negative.")

    def save(self, *args, **kwargs):
        """Override save to include clean validation"""
        self.clean()
        super().save(*args, **kwargs)
        
        
# In your models.py, add this class at the bottom of the file (after all model definitions)
class BookingCancellationService:
    """
    Service class to handle booking cancellation and refund logic
    """
    
    @staticmethod
    def can_cancel_booking(booking):
        """Check if booking can be cancelled"""
        if booking.status != 'booked':
            return False, "Booking is not in 'booked' status"
        
        booking_datetime = booking.get_booking_datetime()
        if timezone.now() >= booking_datetime:
            return False, "Booking has already started or passed"
        
        return True, "Booking can be cancelled"
    
    @staticmethod
    def is_refund_eligible(booking):
        """Check if cancellation is eligible for refund (more than 12 hours before)"""
        can_cancel, message = BookingCancellationService.can_cancel_booking(booking)
        if not can_cancel:
            return False, 0
        
        booking_datetime = booking.get_booking_datetime()
        time_until_booking = booking_datetime - timezone.now()
        
        if time_until_booking.total_seconds() > 12 * 3600:
            # Convert to Decimal to match the field type
            refund_amount = booking.payment.amount if hasattr(booking, 'payment') else 500
            return True, refund_amount  # This is already a Decimal
        else:
            return False, 0
    
    @staticmethod
    def process_cancellation(booking):
        """
        Process booking cancellation with refund logic
        Returns: (success, message, refund_amount, booking)
        """
        # Check if booking can be cancelled
        can_cancel, message = BookingCancellationService.can_cancel_booking(booking)
        if not can_cancel:
            return False, message, 0, booking
        
        # Check refund eligibility
        is_eligible, refund_amount = BookingCancellationService.is_refund_eligible(booking)
        
        # Process refund if eligible
        if is_eligible and refund_amount > 0:
            success = BookingCancellationService._process_refund(booking, refund_amount)
            if success:
                message = f"Booking cancelled successfully. Refund of Rs {refund_amount} processed."
            else:
                message = f"Booking cancelled but refund processing failed. Refund amount: Rs {refund_amount}"
        else:
            refund_amount = 0
            message = "Booking cancelled successfully. No refund issued (cancelled within 12 hours)."
        
        # Update booking status
        booking.status = 'cancelled'
        booking.refund_amount = refund_amount
        booking.cancelled_at = timezone.now()
        booking.save()
        
        return True, message, refund_amount, booking
        
    @staticmethod
    def _process_refund(booking, refund_amount):
        """Process refund to the demo payment account"""
        try:
            payment = booking.payment
            demo_account = DemoPaymentAccount.objects.get(username=payment.username)
            
            # FIX: Ensure refund_amount is Decimal
            from decimal import Decimal
            refund_decimal = Decimal(str(refund_amount))
            
            # Refund the amount to demo account
            demo_account.balance += refund_decimal
            demo_account.save()
            
            # FIX: Update the existing payment record instead of creating a new one
            # Create a refund record by updating the existing payment
            payment.status = 'refund'
            payment.amount = refund_decimal  # Update amount to refund amount
            payment.transaction_id = f"REFUND_{uuid.uuid4()}"
            payment.save()
            
            return True
            
        except (Payment.DoesNotExist, DemoPaymentAccount.DoesNotExist, AttributeError) as e:
            print(f"Refund processing error for booking {booking.id}: {e}")
            return False
    
    @staticmethod
    def get_cancellation_info(booking):
        """Get detailed cancellation information"""
        can_cancel, cancel_message = BookingCancellationService.can_cancel_booking(booking)
        is_eligible, refund_amount = BookingCancellationService.is_refund_eligible(booking)
        
        booking_datetime = booking.get_booking_datetime()
        time_until = booking_datetime - timezone.now()
        hours_until = time_until.total_seconds() / 3600
        
        info = {
            'can_cancel': can_cancel,
            'cancel_message': cancel_message,
            'is_refund_eligible': is_eligible,
            'potential_refund_amount': float(refund_amount) if is_eligible else 0,  # Convert to float for JSON
            'cancellation_deadline': booking.cancellation_deadline,
            'booking_datetime': booking_datetime,
            'hours_until_booking': round(hours_until, 2),
            'current_time': timezone.now(),
        }
        
        # Add human-readable message
        if can_cancel:
            if is_eligible:
                info['message'] = f"Cancel now for full refund of Rs {refund_amount}. Deadline: {info['cancellation_deadline'].strftime('%Y-%m-%d %H:%M')}"
            else:
                info['message'] = "Cancellation available but no refund (within 12 hours of booking)"
        else:
            info['message'] = cancel_message
            
        return info