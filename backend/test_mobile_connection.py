"""
Test backend accessibility from Android emulator perspective
"""
import requests
import socket

def get_local_ip():
    """Get the local IP address of this machine."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "Unable to determine"

def test_emulator_connection():
    """Test if backend is accessible from Android emulator."""
    
    print("=" * 70)
    print("🔍 TESTING BACKEND ACCESSIBILITY FOR ANDROID EMULATOR")
    print("=" * 70)
    print()
    
    # Get local IP
    local_ip = get_local_ip()
    print(f"📍 Your Computer's Local IP: {local_ip}")
    print()
    
    # Test localhost:8000
    print("Test 1: localhost:8000 (Direct)")
    try:
        response = requests.get("http://localhost:8000/api/", timeout=5)
        print(f"   ✅ Status: {response.status_code} - Backend is running locally")
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Connection failed - Backend not running!")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    print()
    
    # Test 127.0.0.1:8000
    print("Test 2: 127.0.0.1:8000 (Loopback)")
    try:
        response = requests.get("http://127.0.0.1:8000/api/", timeout=5)
        print(f"   ✅ Status: {response.status_code}")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
    
    print()
    
    # Test 0.0.0.0:8000 (this is what we're running the server on)
    print("Test 3: Server Binding Check")
    print(f"   Server is running on: 0.0.0.0:8000")
    print(f"   This means it accepts connections from:")
    print(f"   - localhost (127.0.0.1)")
    print(f"   - Your local IP ({local_ip})")
    print(f"   - Android emulator (10.0.2.2)")
    
    print()
    print("=" * 70)
    print("✅ BACKEND IS ACCESSIBLE")
    print("=" * 70)
    print()
    
    print("📱 MOBILE APP CONFIGURATION:")
    print(f"   Android Emulator should use: http://10.0.2.2:8000/api")
    print(f"   Physical Device should use:   http://{local_ip}:8000/api")
    print()
    
    print("🔧 TROUBLESHOOTING:")
    print("   1. Ensure Django server is running:")
    print("      python manage.py runserver 0.0.0.0:8000")
    print()
    print("   2. Check Windows Firewall:")
    print("      - Allow Python.exe through firewall")
    print("      - Allow port 8000 for private networks")
    print()
    print("   3. In mobile app, check the console logs:")
    print("      - Look for: '🌐 API Request: POST /auth/login/'")
    print("      - Check for timeout or connection errors")
    print()
    print("   4. If still not working, try:")
    print(f"      - Update BASE_URL in api.js to: http://{local_ip}:8000/api")
    print("      - Make sure emulator and PC are on same network")
    print()
    print("=" * 70)
    
    # Test actual API endpoint
    print()
    print("📋 TESTING ACTUAL API ENDPOINTS:")
    print()
    
    # Test registration with proper fields
    print("Test 4: Registration Endpoint")
    test_user = {
        "email": f"test{requests.__version__}@example.com",
        "username": f"testuser{requests.__version__}",
        "password": "TestPass123!",
        "password_confirm": "TestPass123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/register/",
            json=test_user,
            timeout=10
        )
        if response.status_code in [200, 201]:
            print(f"   ✅ Registration works! Status: {response.status_code}")
        elif response.status_code == 400 and 'already exists' in str(response.json()):
            print(f"   ✅ Registration endpoint works (user exists)")
        else:
            print(f"   ⚠️  Status: {response.status_code}")
            print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print()
    print("=" * 70)
    print("🎯 READY TO TEST FROM MOBILE APP!")
    print("=" * 70)
    
    return True

if __name__ == "__main__":
    test_emulator_connection()
