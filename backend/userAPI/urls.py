from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import RegisterUserView, logout_view, get_csrf_token, current_user, csrf_exempt,SessionLoginView, adminEditView
urlpatterns = [
    path('register/', RegisterUserView.as_view(), name="register" ),
    path('login/', SessionLoginView.as_view(), name='login' ),
    path('logout/', logout_view, name='logout'),
    path('csrf/', get_csrf_token, name="get-csrf"),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),  # Login endpoint to get token
    path('admin/users/<int:pk>/', adminEditView.as_view(), name='auser-edit'),
    path('current_user/', current_user, name= "current_user"),
    path('csrf', get_csrf_token, name="get_csrf_token"),
]
