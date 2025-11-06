from rest_framework import serializers
from bookingAPI.models import Booking, Payment, DemoPaymentAccount, BookingCancellationService
from ownerAPI.models import Ground
from django.core.exceptions import ValidationError
import datetime
from django.utils import timezone

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['username', 'pin', 'amount']

class BookingSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    customer_username = serializers.CharField(source='user.username', read_only=True)
    customer_email = serializers.EmailField(source='user.email', read_only=True)
    customer_phone = serializers.CharField(source='user.phone', read_only=True)
    price = serializers.DecimalField(source='ground.price', max_digits=10, decimal_places=2, read_only=True)
    futsal_name = serializers.CharField(source='ground.owner.futsal_name', read_only=True)
    ground_type = serializers.CharField(source='ground.ground_type', read_only=True)
    status = serializers.CharField(read_only=True)
    payment = PaymentCreateSerializer(write_only=True)
    is_paid = serializers.SerializerMethodField()
    can_cancel = serializers.BooleanField(read_only=True)
    is_refund_eligible = serializers.BooleanField(read_only=True)
    cancellation_deadline = serializers.SerializerMethodField()
    time_until_booking = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'ground', 'futsal_name', 'booking_date', 'time_slot',
            'status', 'created_at', 'customer_username', 'customer_email',
            'customer_phone', 'ground_type', 'price', 'payment', 'is_paid',
            'can_cancel', 'is_refund_eligible', 'cancellation_deadline', 'time_until_booking'
        ]

    def get_is_paid(self, obj):
        return obj.is_paid

    def get_cancellation_deadline(self, obj):
        """Get formatted cancellation deadline"""
        try:
            return obj.cancellation_deadline.strftime('%Y-%m-%d %H:%M')
        except:
            return None

    def get_time_until_booking(self, obj):
        """Get human-readable time until booking starts"""
        try:
            booking_datetime = obj.get_booking_datetime()
            now = timezone.now()
            time_until = booking_datetime - now
            
            if time_until.total_seconds() <= 0:
                return "Booking has started"
            
            days = time_until.days
            hours = time_until.seconds // 3600
            minutes = (time_until.seconds % 3600) // 60
            
            if days > 0:
                return f"{days}d {hours}h {minutes}m"
            elif hours > 0:
                return f"{hours}h {minutes}m"
            else:
                return f"{minutes}m"
        except Exception:
            return "Time calculation error"

    def validate_booking_date(self, value):
        if value < datetime.date.today():
            raise serializers.ValidationError("Booking date cannot be in the past.")
        return value

    def validate(self, data):
        ground = data.get('ground')
        booking_date = data.get('booking_date')
        time_slot = data.get('time_slot')
        
        if ground and booking_date and time_slot:
            normalized_slot = time_slot.strip().replace('–', '-').replace(' - ', '-').replace('-', ' - ')
            data['time_slot'] = normalized_slot
            
            overlapping = Booking.objects.filter(
                ground=ground,
                booking_date=booking_date,
                time_slot=normalized_slot,
                status='booked'
            )
            
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)
            
            if overlapping.exists():
                raise serializers.ValidationError({
                    "time_slot": "This time slot is already booked for the selected ground and date."
                })
        
        return data

    def create(self, validated_data):
        print("=== DEBUG: Starting booking creation ===")
        
        # Extract payment data
        payment_data = validated_data.pop('payment')
        print(f"Payment data: {payment_data}")
        print(f"Validated data: {validated_data}")
        
        # Validate data before creating booking
        try:
            temp_booking = Booking(**validated_data)
            temp_booking.clean()
            print("=== DEBUG: Model validation passed ===")
        except ValidationError as e:
            print(f"=== DEBUG: Model validation failed: {e} ===")
            raise serializers.ValidationError(e.message_dict)
        
        # Create the actual booking
        try:
            booking = Booking.objects.create(**validated_data)
            print(f"=== DEBUG: Booking created with ID: {booking.id} ===")
        except Exception as e:
            print(f"=== DEBUG: Booking creation failed: {e} ===")
            raise serializers.ValidationError({"error": "Failed to create booking"})
        
        # Validate demo account
        try:
            demo_account = DemoPaymentAccount.objects.get(username=payment_data['username'])
            print(f"=== DEBUG: Demo account found: {demo_account.username} ===")
        except DemoPaymentAccount.DoesNotExist:
            print("=== DEBUG: Demo account not found ===")
            booking.delete()
            raise serializers.ValidationError({"payment": "Demo account not found"})

        # Validate PIN
        if not demo_account.validate(payment_data['pin']):
            print("=== DEBUG: Invalid PIN ===")
            booking.delete()
            raise serializers.ValidationError({"payment": "Invalid PIN for demo account"})

        # FIXED: Always charge Rs 500
        amount = 500
        print(f"=== DEBUG: Fixed amount to charge: {amount} ===")

        # Check balance and charge
        if not demo_account.charge(amount):
            print("=== DEBUG: Insufficient balance ===")
            booking.delete()
            raise serializers.ValidationError({"payment": "Insufficient demo balance"})

        # Create payment record
        try:
            payment = Payment.objects.create(
                user=booking.user,
                booking=booking,
                amount=amount,
                username=payment_data['username'],
                pin=payment_data['pin'],
                status='success'
            )
            print(f"=== DEBUG: Payment created with ID: {payment.id} ===")
        except Exception as e:
            print(f"=== DEBUG: Payment creation failed: {e} ===")
            booking.delete()
            demo_account.balance += amount
            demo_account.save()
            raise serializers.ValidationError({"payment": "Payment processing failed"})

        print("=== DEBUG: Booking and payment completed successfully ===")
        return booking

class BookingCancellationSerializer(serializers.ModelSerializer):
    can_cancel = serializers.BooleanField(read_only=True)
    is_refund_eligible = serializers.BooleanField(read_only=True)
    cancellation_deadline = serializers.SerializerMethodField()
    refund_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    time_until_booking = serializers.SerializerMethodField()
    potential_refund = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'status', 'can_cancel', 'is_refund_eligible', 
            'cancellation_deadline', 'refund_amount', 'time_until_booking',
            'potential_refund'
        ]
        read_only_fields = ['id', 'status', 'refund_amount']

    def get_cancellation_deadline(self, obj):
        """Get formatted cancellation deadline"""
        try:
            return obj.cancellation_deadline.strftime('%Y-%m-%d %H:%M')
        except:
            return None

    def get_time_until_booking(self, obj):
        """Get human-readable time until booking starts"""
        try:
            booking_datetime = obj.get_booking_datetime()
            now = timezone.now()
            time_until = booking_datetime - now
            
            if time_until.total_seconds() <= 0:
                return "Booking has started"
            
            days = time_until.days
            hours = time_until.seconds // 3600
            minutes = (time_until.seconds % 3600) // 60
            
            if days > 0:
                return f"{days}d {hours}h {minutes}m"
            elif hours > 0:
                return f"{hours}h {minutes}m"
            else:
                return f"{minutes}m"
        except Exception:
            return "Time calculation error"

    def get_potential_refund(self, obj):
        """Get potential refund amount if cancelled now"""
        is_eligible, refund_amount = BookingCancellationService.is_refund_eligible(obj)
        return refund_amount if is_eligible else 0

class BookingDetailSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    customer_username = serializers.CharField(source='user.username', read_only=True)
    customer_email = serializers.EmailField(source='user.email', read_only=True)
    customer_phone = serializers.CharField(source='user.phone', read_only=True)
    price = serializers.DecimalField(source='ground.price', max_digits=10, decimal_places=2, read_only=True)
    futsal_name = serializers.CharField(source='ground.owner.futsal_name', read_only=True)
    ground_type = serializers.CharField(source='ground.ground_type', read_only=True)
    is_paid = serializers.SerializerMethodField()
    can_cancel = serializers.BooleanField(read_only=True)
    is_refund_eligible = serializers.BooleanField(read_only=True)
    cancellation_deadline = serializers.SerializerMethodField()
    time_until_booking = serializers.SerializerMethodField()
    payment_info = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'ground', 'futsal_name', 'booking_date', 'time_slot',
            'status', 'created_at', 'cancelled_at', 'refund_amount',
            'customer_username', 'customer_email', 'customer_phone', 
            'ground_type', 'price', 'is_paid', 'can_cancel', 'is_refund_eligible',
            'cancellation_deadline', 'time_until_booking', 'payment_info'
        ]

    def get_is_paid(self, obj):
        return obj.is_paid

    def get_cancellation_deadline(self, obj):
        """Get formatted cancellation deadline"""
        try:
            return obj.cancellation_deadline.strftime('%Y-%m-%d %H:%M')
        except:
            return None

    def get_time_until_booking(self, obj):
        """Get human-readable time until booking starts"""
        try:
            booking_datetime = obj.get_booking_datetime()
            now = timezone.now()
            time_until = booking_datetime - now
            
            if time_until.total_seconds() <= 0:
                return "Booking has started"
            
            days = time_until.days
            hours = time_until.seconds // 3600
            minutes = (time_until.seconds % 3600) // 60
            
            if days > 0:
                return f"{days}d {hours}h {minutes}m"
            elif hours > 0:
                return f"{hours}h {minutes}m"
            else:
                return f"{minutes}m"
        except Exception:
            return "Time calculation error"

    def get_payment_info(self, obj):
        """Get payment information if available"""
        if hasattr(obj, 'payment'):
            return {
                'amount': obj.payment.amount,
                'transaction_id': obj.payment.transaction_id,
                'status': obj.payment.status,
                'paid_at': obj.payment.created_at.strftime('%Y-%m-%d %H:%M')
            }
        return None

class CancelBookingRequestSerializer(serializers.Serializer):
    """Serializer for cancel booking requests"""
    confirm = serializers.BooleanField(
        required=True,
        help_text="Must be true to confirm cancellation"
    )
    
    def validate_confirm(self, value):
        if not value:
            raise serializers.ValidationError("Please confirm cancellation by setting this field to true.")
        return value

class CancellationResponseSerializer(serializers.Serializer):
    """Serializer for cancellation response"""
    success = serializers.BooleanField()
    message = serializers.CharField()
    refund_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    refund_eligible = serializers.BooleanField()
    cancellation_time = serializers.DateTimeField()
    booking = BookingDetailSerializer()

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payment details"""
    user = serializers.StringRelatedField(read_only=True)
    booking_info = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'amount', 'username', 'transaction_id', 
            'status', 'created_at', 'booking_info'
        ]
        read_only_fields = fields

    def get_booking_info(self, obj):
        """Get basic booking information"""
        return {
            'booking_id': obj.booking.id,
            'ground_name': obj.booking.ground.ground_type,
            'futsal_name': obj.booking.ground.owner.futsal_name,
            'booking_date': obj.booking.booking_date,
            'time_slot': obj.booking.time_slot
        }

class DemoPaymentAccountSerializer(serializers.ModelSerializer):
    """Serializer for demo payment accounts"""
    class Meta:
        model = DemoPaymentAccount
        fields = ['id', 'username', 'balance']
        read_only_fields = ['id', 'balance']