"""
API views for user authentication and profile management.
"""

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model

from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user.
    
    POST /api/auth/register/
    Body: {
        "email": "user@example.com",
        "username": "username",
        "password": "password123",
        "password_confirm": "password123",
        "first_name": "John",  # optional
        "last_name": "Doe"  # optional
    }
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Authenticate a user and return JWT tokens.
    
    POST /api/auth/login/
    Body: {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    serializer = UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        # Authenticate user
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            if user.is_active:
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                response_data = {
                    'user': UserProfileSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    },
                    'message': 'Login successful'
                }
                
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': 'Account is disabled'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    Logout user by blacklisting the refresh token.
    
    POST /api/auth/logout/
    Body: {
        "refresh": "refresh_token_here"
    }
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            
        return Response(
            {'message': 'Logout successful'},
            status=status.HTTP_205_RESET_CONTENT
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get the authenticated user's profile.
    
    GET /api/auth/profile/
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update the authenticated user's profile.
    
    PUT/PATCH /api/auth/profile/update/
    Body: {
        "first_name": "John",
        "last_name": "Doe",
        "profile_picture": <file>  # optional
    }
    """
    serializer = UserUpdateSerializer(
        request.user,
        data=request.data,
        partial=True
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                'user': UserProfileSerializer(request.user).data,
                'message': 'Profile updated successfully'
            },
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change the authenticated user's password.
    
    POST /api/auth/change-password/
    Body: {
        "old_password": "oldpassword123",
        "new_password": "newpassword123",
        "new_password_confirm": "newpassword123"
    }
    """
    serializer = ChangePasswordSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_account(request):
    """
    Delete the authenticated user's account.
    
    DELETE /api/auth/delete/
    Body: {
        "password": "password123"
    }
    """
    password = request.data.get('password')
    
    if not password:
        return Response(
            {'error': 'Password is required to delete account'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify password before deletion
    if request.user.check_password(password):
        request.user.delete()
        return Response(
            {'message': 'Account deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )
    else:
        return Response(
            {'error': 'Invalid password'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def list_users(request):
    """
    List all users (for development/debugging purposes).
    
    GET /api/auth/users/
    Note: In production, this should be protected with admin permissions.
    """
    users = User.objects.all().order_by('-date_joined')
    serializer = UserProfileSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request a password reset for a user.
    
    POST /api/auth/password-reset/request/
    Body: {
        "email": "user@example.com"
    }
    
    For development, this returns a reset code directly.
    In production, this would send an email with the reset code.
    """
    serializer = PasswordResetRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        reset_code = serializer.save()
        
        # In production, you would send this code via email
        # For development, we return it directly
        return Response(
            {
                'message': 'Password reset code sent to your email',
                'reset_code': reset_code,  # Remove this in production
            },
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    """
    Confirm password reset using the reset code.
    
    POST /api/auth/password-reset/confirm/
    Body: {
        "email": "user@example.com",
        "reset_code": "123456",
        "new_password": "newpassword123",
        "new_password_confirm": "newpassword123"
    }
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(
            {'message': 'Password reset successfully'},
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

