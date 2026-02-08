"""
URL configuration for users app.
"""

from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    
    # Profile management endpoints
    path('profile/', views.get_user_profile, name='profile'),
    path('profile/update/', views.update_user_profile, name='profile-update'),
    path('change-password/', views.change_password, name='change-password'),
    path('delete/', views.delete_user_account, name='delete-account'),
    
    # Password reset endpoints
    path('password-reset/request/', views.request_password_reset, name='password-reset-request'),
    path('password-reset/confirm/', views.confirm_password_reset, name='password-reset-confirm'),
    
    # Admin/Debug endpoints
    path('users/', views.list_users, name='list-users'),
]
