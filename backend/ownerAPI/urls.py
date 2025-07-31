from django.urls import path
from .views import RegisterOwnerView,list_owners_admins_and_customers, all_grounds

urlpatterns = [
    path('register-owner/', RegisterOwnerView.as_view(), name='register-owner'),
    # path('current_owner/', current_owner, name= "current_owner"),
    path('all-users/', list_owners_admins_and_customers, name='list-owners-admins'),
    path('grounds/', all_grounds, name='grounds')
]
