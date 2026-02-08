"""
Enhanced connection test with proper field validation
"""
import requests
import json

def test_full_integration():
    base_url = "http://localhost:8000"
    
    print("=" * 70)
    print("🔗 BACKEND-FRONTEND CONNECTION TEST")
    print("=" * 70)
    print()
    
    # Test 1: Server Health
    print("✅ Test 1: Server Health Check")
    try:
        response = requests.get(f"{base_url}/admin/", timeout=5)
        print(f"   ✓ Server is RUNNING (Status: {response.status_code})")
        print()
    except requests.exceptions.ConnectionError:
        print("   ❌ SERVER NOT RUNNING!")
        print("   Run: python manage.py runserver 0.0.0.0:8000")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test 2: Registration with correct fields
    print("✅ Test 2: User Registration (with password_confirm)")
    test_user = {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        "first_name": "New",
        "last_name": "User"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/auth/register/",
            json=test_user,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"   Status: {response.status_code}")
        data = response.json()
        
        if response.status_code in [200, 201]:
            print("   ✓ Registration SUCCESSFUL!")
            print(f"   ✓ Access Token: {data.get('tokens', {}).get('access', 'N/A')[:30]}...")
            print(f"   ✓ User: {data.get('user', {}).get('username', 'N/A')}")
            access_token = data.get('tokens', {}).get('access')
        elif response.status_code == 400:
            if 'email' in data and 'already exists' in str(data['email']):
                print("   ⚠️  User already exists (this is OK for testing)")
                access_token = None
            else:
                print(f"   ❌ Validation Error: {data}")
                access_token = None
        else:
            print(f"   ❌ Unexpected response: {data}")
            access_token = None
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        access_token = None
    
    print()
    
    # Test 3: Login with email
    print("✅ Test 3: User Login (with email)")
    login_data = {
        "email": "newuser@example.com",
        "password": "SecurePass123!"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/auth/login/",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✓ Login SUCCESSFUL!")
            print(f"   ✓ Access Token: {data.get('tokens', {}).get('access', 'N/A')[:30]}...")
            print(f"   ✓ User: {data.get('user', {}).get('username', 'N/A')}")
            access_token = data.get('tokens', {}).get('access')
        else:
            data = response.json()
            print(f"   Response: {data}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print()
    
    # Test 4: Profile Access (if we have token)
    if access_token:
        print("✅ Test 4: Authenticated Profile Access")
        try:
            response = requests.get(
                f"{base_url}/api/auth/profile/",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {access_token}"
                },
                timeout=10
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("   ✓ Profile access SUCCESSFUL!")
                print(f"   ✓ User: {data.get('username', 'N/A')}")
                print(f"   ✓ Email: {data.get('email', 'N/A')}")
            else:
                print(f"   ❌ Status: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    else:
        print("⚠️  Test 4: Skipped (no access token)")
    
    print()
    print("=" * 70)
    print("✅ CONNECTION TEST COMPLETE!")
    print("=" * 70)
    print()
    print("📱 MOBILE APP SETUP:")
    print("   1. Make sure your Android emulator is running")
    print("   2. Backend URL in mobile app: http://10.0.2.2:8000/api")
    print("   3. Try registering a new user from the mobile app")
    print()
    print("🔧 SERVER INFO:")
    print("   Django backend is running on: http://0.0.0.0:8000")
    print("   Admin panel: http://localhost:8000/admin (create superuser first)")
    print()
    print("📊 TO VIEW DATABASE TABLES:")
    print("   Option 1: Install pgAdmin - https://www.pgadmin.org/")
    print("   Option 2: Use psql - psql -U postgres -d emotion_companion")
    print("   Option 3: Django Admin - http://localhost:8000/admin")
    print("=" * 70)
    
    return True

if __name__ == "__main__":
    test_full_integration()
