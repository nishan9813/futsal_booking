from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import OwnerProfile, GroundImage, Ground

admin.site.register(OwnerProfile)
admin.site.register(GroundImage)
admin.site.register(Ground)




