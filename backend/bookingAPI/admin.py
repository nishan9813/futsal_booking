from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('ground', 'user', 'booking_date', 'time_slot', 'status', 'created_at')
    list_filter = ('status', 'booking_date')
    search_fields = ('ground__futsal_name', 'user__username')
    readonly_fields = ('created_at',)
    ordering = ('-booking_date', 'time_slot')  # replaced start_time/end_time with time_slot
