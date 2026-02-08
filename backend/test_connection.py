"""
Test script to verify backend server is running and accessible
"""
import requests
import json

def test_server():
    base_url = "http://localhost:8000"
    
    print("=" * 60)
    print("🔍 Testing Django Backend Server Connection")
    print("=" * 60)
    print()
    
    # Test 1: Check if server is running
    print("Test 1: Checking server health...")
    try:
        response = requests.get(f"{base_url}/api/", timeout=5)
        print(f"✅ Server is running!")
        print(f"   Status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print(f"❌ Server is NOT running!")
        print(f"   Please start the server with: python manage.py runserver")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    print()
    
    # Test 2: Test registration endpoint
    print("Test 2: Testing registration endpoint...")
    try:
        test_user = {
            "email": "testuser@example.com",
            "username": "testuser",
            "password": "TestPass123!",
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = requests.post(
            f"{base_url}/api/auth/register/",
            json=test_user,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code in [200, 201]:
            print("✅ Registration endpoint works!")
        elif response.status_code == 400:
            print("⚠️  Registration endpoint works (user may already exist)")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    
    # Test 3: Test login endpoint
    print("Test 3: Testing login endpoint...")
    try:
        login_data = {
            "username": "testuser",
            "password": "TestPass123!"
        }
        
        response = requests.post(
            f"{base_url}/api/auth/login/",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful!")
            print(f"   Access Token: {data.get('access', 'N/A')[:20]}...")
            if 'refresh' in data:
                print(f"   Refresh Token: {data['refresh'][:20]}...")
        else:
            print(f"   Response: {response.json()}")
            print(f"⚠️  Login status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    print("=" * 60)
    print("✅ Connection Test Complete!")
    print("=" * 60)
    print()
    print("📱 Mobile App Configuration:")
    print("   Android Emulator: http://10.0.2.2:8000/api")
    print("   iOS Simulator: http://localhost:8000/api")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    test_server()
