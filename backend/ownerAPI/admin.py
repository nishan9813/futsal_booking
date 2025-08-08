from django.contrib import admin
from .models import OwnerProfile, Ground, GroundImage

@admin.register(GroundImage)
class GroundImageAdmin(admin.ModelAdmin):
    list_display = ('ground', 'image', 'uploaded_at')
    list_filter = ('ground',)
    search_fields = ('ground__ground_type',)

admin.site.register(OwnerProfile)

@admin.register(Ground)
class GroundAdmin(admin.ModelAdmin):
    list_display = ('ground_type', 'owner', 'price')
