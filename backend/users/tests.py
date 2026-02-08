"""
Tests for users app.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class UserModelTests(TestCase):
    """Tests for the User model."""

    def test_create_user(self):
        """Test creating a user."""
        email = 'test@example.com'
        username = 'testuser'
        password = 'testpass123'
        
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password
        )
        
        self.assertEqual(user.email, email)
        self.assertEqual(user.username, username)
        self.assertTrue(user.check_password(password))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        """Test creating a superuser."""
        email = 'admin@example.com'
        username = 'admin'
        password = 'adminpass123'
        
        user = User.objects.create_superuser(
            email=email,
            username=username,
            password=password
        )
        
        self.assertEqual(user.email, email)
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_user_email_required(self):
        """Test that creating a user without email raises error."""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email='',
                username='testuser',
                password='testpass123'
            )

    def test_user_username_required(self):
        """Test that creating a user without username raises error."""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email='test@example.com',
                username='',
                password='testpass123'
            )
