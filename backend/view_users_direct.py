"""
Simple Database Viewer - View all user data from the command line
Run this with: python manage.py shell < view_users.py
Or: python view_users_direct.py
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emotion_companion.settings')
django.setup()

from users.models import User
from datetime import datetime

def view_all_users():
    """Display all users in a formatted table."""
    print("\n" + "=" * 100)
    print("📊 USER DATABASE - Emotion Companion")
    print("=" * 100)
    
    users = User.objects.all().order_by('-date_joined')
    
    if not users:
        print("\n⚠️  No users in database yet.")
        print("\n💡 CREATE A NEW USER:")
        print("   - Register from mobile app")
        print("   - Or create superuser: python manage.py createsuperuser")
        print("=" * 100)
        return
    
    print(f"\nTotal Users: {users.count()}\n")
    
    # Table header
    header = f"{'ID':<5} {'Username':<20} {'Email':<30} {'Name':<25} {'Joined':<20} {'Staff':<6}"
    print(header)
    print("-" * 100)
    
    # Table rows
    for user in users:
        full_name = user.get_full_name() or "-"
        joined = user.date_joined.strftime("%Y-%m-%d %H:%M") if user.date_joined else "-"
        is_staff = "Yes" if user.is_staff else "No"
        
        row = (
            f"{user.id:<5} "
            f"{user.username:<20} "
            f"{user.email:<30} "
            f"{full_name:<25} "
            f"{joined:<20} "
            f"{is_staff:<6}"
        )
        print(row)
    
    print("=" * 100)
    
    # Show detailed info for the last registered user
    if users:
        last_user = users[0]
        print("\n📝 DETAILS OF LAST REGISTERED USER:")
        print(f"   ID: {last_user.id}")
        print(f"   Username: {last_user.username}")
        print(f"   Email: {last_user.email}")
        print(f"   First Name: {last_user.first_name or '(not set)'}")
        print(f"   Last Name: {last_user.last_name or '(not set)'}")
        print(f"   Profile Picture: {last_user.profile_picture or '(not set)'}")
        print(f"   Date Joined: {last_user.date_joined}")
        print(f"   Last Login: {last_user.last_login or '(never)'}")
        print(f"   Is Active: {last_user.is_active}")
        print(f"   Is Staff: {last_user.is_staff}")
        print(f"   Is Superuser: {last_user.is_superuser}")
    
    print("=" * 100 + "\n")

if __name__ == "__main__":
    try:
        view_all_users()
    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        import traceback
        traceback.print_exc()
