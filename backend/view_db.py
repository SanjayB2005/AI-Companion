"""
Quick Database Viewer - View all tables and data
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emotion_companion.settings')
django.setup()

from django.apps import apps
from django.db import connection


def view_all_tables():
    """Display all database tables and their data."""
    print("=" * 80)
    print("📊 DATABASE TABLES VIEWER")
    print("=" * 80)
    print()
    
    # Get all tables from database
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cursor.fetchall()]
    
    print(f"✅ Found {len(tables)} table(s) in database\n")
    
    for i, table_name in enumerate(tables, 1):
        print("-" * 80)
        print(f"📋 TABLE #{i}: {table_name}")
        print("-" * 80)
        
        with connection.cursor() as cursor:
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"Total rows: {count}")
            
            if count > 0:
                # Get column names  
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                
                print(f"\nColumns: {', '.join(columns)}")
                print("\nData (showing first 5 rows):")
                
                for row in rows:
                    print(f"  {dict(zip(columns, row))}")
            else:
                print("  (No data)")
        
        print()
    
    print("=" * 80)


def view_users():
    """View all users using Django ORM."""
    from users.models import CustomUser
    
    print("=" * 80)
    print("👥 USER ACCOUNTS")
    print("=" * 80)
    print()
    
    users = CustomUser.objects.all()
    
    if not users:
        print("⚠️  No users found in database")
        print("\n💡 Create a user account using:")
        print("   - Mobile app: Signup screen")
        print("   - Django admin: python manage.py createsuperuser")
        print()
        return
    
    print(f"Total users: {users.count()}\n")
    
    for i, user in enumerate(users, 1):
        print(f"{i}. {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.first_name} {user.last_name}")
        print(f"   Active: {'✅' if user.is_active else '❌'}")
        print(f"   Staff: {'✅' if user.is_staff else '❌'}")
        print(f"   Joined: {user.date_joined}")
        print()
    
    print("=" * 80)


if __name__ == '__main__':
    print("\n")
    view_users()
    print("\n")
    view_all_tables()
