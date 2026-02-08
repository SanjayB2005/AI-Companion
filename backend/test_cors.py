import requests

# Test CORS preflight request (OPTIONS)
print("Testing CORS preflight request...")
try:
    response = requests.options(
        'http://localhost:8000/api/auth/login/',
        headers={
            'Origin': 'http://localhost:8081',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type,authorization'
        }
    )
    print(f"Status Code: {response.status_code}")
    print(f"CORS Headers:")
    for header, value in response.headers.items():
        if 'access-control' in header.lower() or 'cors' in header.lower():
            print(f"  {header}: {value}")
    
    if 'Access-Control-Allow-Origin' in response.headers:
        print("\n✅ CORS is working! Access-Control-Allow-Origin header is present")
    else:
        print("\n❌ CORS issue: Access-Control-Allow-Origin header is missing")
        
except Exception as e:
    print(f"❌ Error: {e}")

# Test actual POST request
print("\n" + "="*50)
print("Testing actual login request...")
try:
    response = requests.post(
        'http://localhost:8000/api/auth/login/',
        json={'email': 'newuser@example.com', 'password': 'SecurePass123!'},
        headers={'Origin': 'http://localhost:8081'}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json() if response.status_code == 200 else response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
