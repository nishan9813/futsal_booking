from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterUserView, current_user, MyTokenObtainPairView, LogoutView, UserUpdateView, CustomUserAdminView


router = DefaultRouter()
router.register(r'admin-users', CustomUserAdminView, basename='admin-user')

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name="register"),
    path('current_user/', current_user, name="current_user"),
    path('login/', MyTokenObtainPairView.as_view(), name="login"),
    path('logout/', LogoutView.as_view(), name="logout"),
    path('userUpdate/', UserUpdateView.as_view(), name="userUpdate"),
    path('userUpdate/', UserUpdateView.as_view(), name="userUpdate"),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # you can add logout here if implemented
]

urlpatterns += router.urls
