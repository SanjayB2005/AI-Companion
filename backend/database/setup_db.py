"""
Database setup script for Emotion Companion
This script helps automate database creation and initial setup
"""

import psycopg
from psycopg import IsolationLevel
import os
import sys

# Try to load .env file
try:
    from decouple import config
    USE_DECOUPLE = True
except ImportError:
    USE_DECOUPLE = False


def create_database():
    """Create the PostgreSQL database if it doesn't exist."""
    
    # Database connection parameters - use decouple if available
    if USE_DECOUPLE:
        db_name = config('DATABASE_NAME', default='emotion_companion')
        db_user = config('DATABASE_USER', default='postgres')
        db_password = config('DATABASE_PASSWORD', default='postgres')
        db_host = config('DATABASE_HOST', default='localhost')
        db_port = config('DATABASE_PORT', default='5432')
    else:
        db_name = os.getenv('DATABASE_NAME', 'emotion_companion')
        db_user = os.getenv('DATABASE_USER', 'postgres')
        db_password = os.getenv('DATABASE_PASSWORD', 'postgres')
        db_host = os.getenv('DATABASE_HOST', 'localhost')
        db_port = os.getenv('DATABASE_PORT', '5432')
    
    print(f"Attempting to create database: {db_name}")
    print(f"Connecting as user: {db_user}")
    print(f"Host: {db_host}:{db_port}")
    print(f"Password length: {len(db_password)} characters")
    
    try:
        # Connect to PostgreSQL server (default postgres database)
        conn = psycopg.connect(
            dbname='postgres',
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port,
            autocommit=True
        )
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s",
            (db_name,)
        )
        exists = cursor.fetchone()
        
        if not exists:
            # Create database
            cursor.execute(f'CREATE DATABASE {db_name}')
            print(f"✓ Database '{db_name}' created successfully!")
        else:
            print(f"✓ Database '{db_name}' already exists.")
        
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg.Error as e:
        print(f"✗ Error creating database: {e}")
        return False


def run_schema():
    """Run the schema.sql file to create additional tables."""
    
    if USE_DECOUPLE:
        db_name = config('DATABASE_NAME', default='emotion_companion')
        db_user = config('DATABASE_USER', default='postgres')
        db_password = config('DATABASE_PASSWORD', default='postgres')
        db_host = config('DATABASE_HOST', default='localhost')
        db_port = config('DATABASE_PORT', default='5432')
    else:
        db_name = os.getenv('DATABASE_NAME', 'emotion_companion')
        db_user = os.getenv('DATABASE_USER', 'postgres')
        db_password = os.getenv('DATABASE_PASSWORD', 'postgres')
        db_host = os.getenv('DATABASE_HOST', 'localhost')
        db_port = os.getenv('DATABASE_PORT', '5432')
    
    print(f"\nRunning schema.sql on database: {db_name}")
    
    try:
        # Connect to the newly created database
        conn = psycopg.connect(
            dbname=db_name,
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        cursor = conn.cursor()
        
        # Read and execute schema.sql
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        cursor.execute(schema_sql)
        conn.commit()
        
        print("✓ Schema applied successfully!")
        
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg.Error as e:
        print(f"✗ Error running schema: {e}")
        return False
    except FileNotFoundError:
        print(f"✗ schema.sql file not found at {schema_path}")
        return False


def main():
    """Main function to set up the database."""
    
    print("=" * 60)
    print("Emotion Companion - Database Setup")
    print("=" * 60)
    
    # Load environment variables from .env if available
    if USE_DECOUPLE:
        print("\n✓ Environment variables loaded from .env")
    else:
        print("\n⚠ python-decouple not installed. Using default environment variables.")
        print("  Install it with: pip install python-decouple")
    
    # Step 1: Create database
    if not create_database():
        print("\n✗ Database setup failed!")
        sys.exit(1)
    
    # Step 2: Run schema (optional, as Django migrations will handle most tables)
    print("\nNote: Django migrations will create the users table.")
    print("The schema.sql file contains future tables for ML integration.")
    
    response = input("\nDo you want to run schema.sql now? (y/n): ").lower()
    if response == 'y':
        if not run_schema():
            print("\n⚠ Schema setup encountered errors.")
    
    print("\n" + "=" * 60)
    print("Database setup complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Run Django migrations:")
    print("   python manage.py makemigrations")
    print("   python manage.py migrate")
    print("\n2. Create a superuser:")
    print("   python manage.py createsuperuser")
    print("\n3. Start the development server:")
    print("   python manage.py runserver")
    print("=" * 60)


if __name__ == '__main__':
    main()