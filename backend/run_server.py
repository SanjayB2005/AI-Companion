#!/usr/bin/env python
"""
Run Django development server on all interfaces (0.0.0.0:8000)
This allows external devices (mobile apps) to connect to the backend.
"""
import os
import sys
import subprocess

def run_server():
    """Run Django development server on all interfaces"""
    
    print("🚀 Starting Django Backend Server...")
    print("📡 Running on all interfaces (0.0.0.0:8000)")
    print("📱 Mobile devices can now connect!")
    print("🌐 Access at: http://localhost:8000 or http://your-ip:8000")
    print("-" * 50)
    
    # Set Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emotion_companion.settings')
    
    try:
        # Run Django development server on all interfaces
        subprocess.run([
            sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'
        ], check=True)
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
        print("💡 Make sure you're in the virtual environment and database is running")
        return False
    except FileNotFoundError:
        print("❌ Python or manage.py not found")
        print("💡 Make sure you're in the backend directory")
        return False
        
    return True

if __name__ == '__main__':
    run_server()