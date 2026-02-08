# ✅ Backend-Frontend Connection Setup - COMPLETE!

## 🎉 SUCCESS! Your Backend is Running

The Django backend server is now **RUNNING** and **CONNECTED** to the database.

### Current Status:
- ✅ All dependencies installed
- ✅ Database migrations applied
- ✅ Django server running on `http://0.0.0.0:8000`
- ✅ API endpoints tested and working
- ✅ Users in database: **2 users**

---

## 📱 Test from Mobile App

### 1. Start Your Mobile App (if not already running):
```powershell
cd "E:\projects\Emotion-Aware AI Companion\mobile"
npm start
```

### 2. Open Android Emulator:
- Press `a` in the Expo terminal
- Or scan QR code with Expo Go app

### 3. Test Registration:
- Open the Signup screen
- Fill in:
  - Email: `test2@example.com`
  - Username: `test2`
  - Password: `Test123456!`
  - Confirm Password: `Test123456!`
- Click "Sign Up"
- ✅ You should be logged in automatically

### 4. Test Login:
- If already registered, use Login screen
- Enter your email and password
- ✅ You should see the Home screen

---

## 🔍 View Database Users

Run this anytime to see all users in your database:
```powershell
cd "E:\projects\Emotion-Aware AI Companion\backend"
python view_users_direct.py
```

**Current Users:**
| ID | Username  | Email                 | Name     | Joined       |
|----|-----------|----------------------|----------|--------------|
| 2  | newuser   | newuser@example.com  | New User | 2026-02-08   |
| 1  | sanjayb   | bsanjay@gmail.com    | sanjayb  | 2026-02-08   |

---

## 🛠️ Useful Commands

### Backend Commands:
```powershell
# Start Django server (if stopped)
cd "E:\projects\Emotion-Aware AI Companion\backend"
python manage.py runserver 0.0.0.0:8000

# View all users
python view_users_direct.py

# Test API connection
python test_full_connection.py

# Create superuser (for admin panel)
python manage.py createsuperuser

# Access admin panel
# http://localhost:8000/admin
```

### Mobile Commands:
```powershell
# Start mobile app
cd "E:\projects\Emotion-Aware AI Companion\mobile"
npm start

# For Android
# Press 'a' in terminal
```

---

## 📊 View Database Tables (3 Options)

### Option 1: Python Script (Easiest)
```powershell
cd "E:\projects\Emotion-Aware AI Companion\backend"
python view_users_direct.py
```

### Option 2: Django Admin Panel
1. Create superuser:
   ```powershell
   python manage.py createsuperuser
   ```
2. Visit: http://localhost:8000/admin
3. Login with superuser credentials
4. Browse Users, Sessions, etc.

### Option 3: PostgreSQL CLI
```powershell
psql -U postgres -d emotion_companion

# Inside psql:
\dt                          # List all tables
SELECT * FROM users_user;    # View users
\q                           # Quit
```

### Option 4: pgAdmin (GUI Tool)
1. Download: https://www.pgadmin.org/download/
2. Install and open
3. Create server connection:
   - Host: `localhost`
   - Port: `5432`
   - Database: `emotion_companion`
   - Username: `postgres`
   - Password: `postgres`
4. Navigate: Servers → PostgreSQL → Databases → emotion_companion → Schemas → public → Tables → users_user
5. Right-click → View/Edit Data → All Rows

---

## 🔗 API Endpoints (All Working!)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/auth/register/` | POST | Register new user | ✅ |
| `/api/auth/login/` | POST | Login user | ✅ |
| `/api/auth/profile/` | GET | Get user profile | ✅ |
| `/api/auth/profile/update/` | PUT/PATCH | Update profile | ✅ |
| `/api/auth/logout/` | POST | Logout user | ✅ |

---

## 🐛 Troubleshooting

### Mobile app shows "Connection Timeout"
**Solution:**
1. Check Django server is running:
   ```powershell
   cd "E:\projects\Emotion-Aware AI Companion\backend"
   python manage.py runserver 0.0.0.0:8000
   ```

### "Module not found" errors in backend
**Solution:**
```powershell
cd "E:\projects\Emotion-Aware AI Companion\backend"
python -m pip install -r requirements.txt
```

### Can't see database data
**Solution:**
```powershell
cd "E:\projects\Emotion-Aware AI Companion\backend"
python view_users_direct.py
```

### Registration fails with "password too common"
**Solution:** Use a stronger password:
- At least 8 characters
- Mix of letters and numbers
- Include special characters
- Example: `SecurePass123!`

---

## 📝 Next Steps

1. ✅ Backend is running
2. ✅ Database is connected
3. ✅ API endpoints tested
4. 🔲 Test registration from mobile app
5. 🔲 Test login from mobile app
6. 🔲 Add emotion detection features (Phase 2)

---

## 📞 Quick Reference

### Mobile App Config:
- Base URL: `http://10.0.2.2:8000/api`
- Located in: `mobile/src/services/api.js`

### Backend Server:
- Running on: `http://0.0.0.0:8000`
- Admin: `http://localhost:8000/admin`

### Database:
- Name: `emotion_companion`
- Host: `localhost:5432`
- User: `postgres`

---

**🎯 Everything is set up and ready to test!**

Try registering a new user from your mobile app now!
