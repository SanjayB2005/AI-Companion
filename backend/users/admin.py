"""
Admin configuration for users app.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User, PasswordResetCode


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for custom User model."""
    
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'is_superuser', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        (_('Personal Info'), {'fields': ('first_name', 'last_name', 'profile_picture')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login')


@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    """Admin configuration for PasswordResetCode model."""
    
    list_display = ('user', 'code', 'created_at', 'expires_at', 'is_expired')
    list_filter = ('created_at', 'expires_at')
    search_fields = ('user__email', 'user__username', 'code')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    
    def is_expired(self, obj):
        """Display if code is expired."""
        return obj.is_expired()
    is_expired.boolean = True
    is_expired.short_description = 'Expired'

