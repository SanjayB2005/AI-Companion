"""
Serializers for user authentication and profile management.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import PasswordResetCode

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        """Create a new user."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'profile_picture',
            'date_joined',
            'last_login'
        )
        read_only_fields = ('id', 'email', 'date_joined', 'last_login')


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'profile_picture')

    def update(self, instance, validated_data):
        """Update user profile."""
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        
        if 'profile_picture' in validated_data:
            instance.profile_picture = validated_data['profile_picture']
        
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """Validate that new passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {"new_password": "Password fields didn't match."}
            )
        return attrs

    def validate_old_password(self, value):
        """Validate that the old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def save(self):
        """Change the user's password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting password reset."""
    
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """Validate that a user with this email exists."""
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address.")
        return value

    def save(self):
        """Generate and store a password reset code."""
        import random
        from django.utils import timezone
        from datetime import timedelta
        
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate 6-digit reset code
        reset_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        # Delete any existing reset codes for this user
        PasswordResetCode.objects.filter(user=user).delete()
        
        # Create new reset code with expiration (15 minutes)
        expiration_time = timezone.now() + timedelta(minutes=15)
        PasswordResetCode.objects.create(
            user=user,
            code=reset_code,
            expires_at=expiration_time
        )
        
        return reset_code


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset with code."""
    
    email = serializers.EmailField(required=True)
    reset_code = serializers.CharField(required=True, max_length=6)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """Validate passwords match and reset code is valid."""
        from django.utils import timezone
        
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {"new_password": "Password fields didn't match."}
            )
        
        email = attrs['email']
        reset_code = attrs['reset_code']
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"email": "No user found with this email address."}
            )
        
        # Check if reset code exists and is valid
        try:
            code_obj = PasswordResetCode.objects.get(user=user, code=reset_code)
            
            # Check if code has expired
            if timezone.now() > code_obj.expires_at:
                code_obj.delete()
                raise serializers.ValidationError(
                    {"reset_code": "Reset code has expired. Please request a new one."}
                )
            
            attrs['user'] = user
            attrs['code_obj'] = code_obj
            
        except PasswordResetCode.DoesNotExist:
            raise serializers.ValidationError(
                {"reset_code": "Invalid reset code."}
            )
        
        return attrs

    def save(self):
        """Reset the user's password."""
        user = self.validated_data['user']
        code_obj = self.validated_data['code_obj']
        
        user.set_password(self.validated_data['new_password'])
        user.save()
        
        # Delete the used reset code
        code_obj.delete()
        
        return user

