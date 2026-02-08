#!/usr/bin/env python
"""
Setup script to initialize the Django backend
Run this after creating the virtual environment and installing requirements
"""

import os
import sys
import subprocess


def run_command(command, description):
    """Run a shell command and print the result."""
    print(f"\n{'='*60}")
    print(f"🔧 {description}")
    print(f"{'='*60}\n")
    
    result = subprocess.run(command, shell=True, capture_output=False, text=True)
    
    if result.returncode == 0:
        print(f"✅ {description} - SUCCESS")
    else:
        print(f"❌ {description} - FAILED")
        return False
    
    return True


def main():
    """Main setup function."""
    print("\n" + "="*60)
    print("🚀 Emotion Companion Backend Setup")
    print("="*60)
    
    # Check if we're in the backend directory
    if not os.path.exists('manage.py'):
        print("\n❌ Error: manage.py not found!")
        print("Please run this script from the backend directory.")
        sys.exit(1)
    
    # Check if .env exists
    if not os.path.exists('.env'):
        print("\n⚠️  Warning: .env file not found!")
        print("Copying .env.example to .env...")
        if os.path.exists('.env.example'):
            import shutil
            shutil.copy('.env.example', '.env')
            print("✅ .env file created. Please update it with your settings.")
        else:
            print("❌ .env.example not found!")
            sys.exit(1)
    
    # Run migrations
    if not run_command(
        'python manage.py makemigrations',
        'Creating database migrations'
    ):
        sys.exit(1)
    
    if not run_command(
        'python manage.py migrate',
        'Applying database migrations'
    ):
        sys.exit(1)
    
    # Create superuser prompt
    print("\n" + "="*60)
    print("👤 Create superuser account")
    print("="*60)
    create_superuser = input("\nDo you want to create a superuser account? (y/n): ")
    
    if create_superuser.lower() == 'y':
        run_command(
            'python manage.py createsuperuser',
            'Creating superuser'
        )
    
    # Collect static files
    run_command(
        'python manage.py collectstatic --noinput',
        'Collecting static files'
    )
    
    print("\n" + "="*60)
    print("✅ Setup completed successfully!")
    print("="*60)
    print("\n📝 Next steps:")
    print("1. Update the .env file with your database credentials")
    print("2. Make sure PostgreSQL is running")
    print("3. Run: python manage.py runserver")
    print("\n🌐 API will be available at: http://localhost:8000/api/")
    print("🔐 Admin panel: http://localhost:8000/admin/")
    print("="*60 + "\n")


if __name__ == '__main__':
    main()
