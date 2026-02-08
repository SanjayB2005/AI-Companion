# Backend and Frontend Integration Guide

## Overview
This guide explains how to set up and integrate the Django backend with the React Native frontend.

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### 2. Configure Database

```bash
# Copy environment example
copy .env.example .env

# Edit .env file with your PostgreSQL credentials
# Ensure PostgreSQL is running
```

### 3. Set Up Database

```bash
# Option 1: Use setup script (recommended)
python database/setup_db.py

# Option 2: Manual setup
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### 4. Run Django Server

```bash
python manage.py runserver
```

Backend should now be running at: `http://localhost:8000`

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd mobile
npm install --legacy-peer-deps
```

### 2. Configure API URL

Edit [src/services/api.js](mobile/src/services/api.js#L4):

```javascript
// For Android Emulator
const BASE_URL = 'http://10.0.2.2:8000/api';

// For iOS Simulator
const BASE_URL = 'http://localhost:8000/api';

// For Physical Device (replace with your computer's IP)
const BASE_URL = 'http://192.168.1.100:8000/api';
```

**To find your computer's IP:**
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr` (look for inet address)

### 3. Run React Native App

```bash
# Clear cache and start
npx expo start -c

# Or use specific platform
npx expo start --android
npx expo start --ios
```

---

## Testing the Integration

### 1. Backend Health Check

Test if backend is running:
```bash
curl http://localhost:8000/api/auth/login/
```

You should see a response indicating the endpoint exists.

### 2. Frontend to Backend Connection

From your mobile app:
1. Go to the signup screen
2. Create a new account
3. Check Django server logs for the request

### 3. Common Issues

**Issue:** "Network Error" or "Connection Refused"

**Solutions:**
- Ensure Django server is running
- Check firewall settings (allow port 8000)
- Verify API URL in `api.js` matches your setup
- For physical devices, ensure phone and computer are on same WiFi

**Issue:** CORS errors

**Solution:**
- Update `CORS_ALLOWED_ORIGINS` in [backend/.env](backend/.env)
- Add your mobile device IP: `http://192.168.1.100:19000`

**Issue:** Token authentication fails

**Solution:**
- Clear AsyncStorage in the app
- Check token is being saved properly
- Verify JWT settings in [backend/emotion_companion/settings.py](backend/emotion_companion/settings.py)

---

## API Endpoints

All endpoints are documented in [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

### Quick Reference:

- **POST** `/api/auth/register/` - Register new user
- **POST** `/api/auth/login/` - Login user  
- **POST** `/api/auth/logout/` - Logout user
- **GET** `/api/auth/profile/` - Get user profile
- **PATCH** `/api/auth/profile/update/` - Update profile
- **POST** `/api/auth/change-password/` - Change password
- **DELETE** `/api/auth/delete/` - Delete account
- **POST** `/api/token/refresh/` - Refresh access token

---

## Development Workflow

### Backend Changes:

1. Make changes to Django code
2. Run migrations if models changed:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
3. Server auto-reloads (no restart needed)

### Frontend Changes:

1. Make changes to React Native code
2. Save files
3. App auto-reloads with Fast Refresh
4. For major changes, restart: `npx expo start -c`

---

## Database Admin

Django admin panel: `http://localhost:8000/admin/`

1. Create superuser: `python manage.py createsuperuser`
2. Login to admin panel
3. View/manage users and data

---

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_NAME=emotion_companion
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
CORS_ALLOWED_ORIGINS=http://localhost:19000,http://10.0.2.2:19000
```

### Frontend (.env)
```env
API_BASE_URL=http://10.0.2.2:8000/api
```

---

## Production Deployment

### Backend:
1. Set `DEBUG=False` in `.env`
2. Generate secure `SECRET_KEY`
3. Update `ALLOWED_HOSTS`
4. Use production database
5. Set up HTTPS
6. Configure proper CORS origins

### Frontend:
1. Update API_BASE_URL to production URL
2. Build app: `eas build`
3. Submit to app stores

---

## Troubleshooting Commands

```bash
# Backend - Check migrations status
python manage.py showmigrations

# Backend - Create test user via shell
python manage.py shell
>>> from users.models import User
>>> User.objects.create_user('test@example.com', 'testuser', 'password123')

# Frontend - Clear cache
npx expo start -c

# Frontend - Clear node modules
rm -rf node_modules
npm install --legacy-peer-deps

# Check Django server logs for errors
# Check Metro bundler logs for frontend errors
```

---

## Next Steps

1. ✅ Backend configured with PostgreSQL
2. ✅ Authentication endpoints working
3. ✅ Frontend integrated with backend
4. ⏳ Add ML model integration (Phase 2)
5. ⏳ Implement voice emotion detection (Phase 2)
6. ⏳ Implement face emotion detection (Phase 2)

For questions or issues, refer to:
- [Backend README](backend/README.md)
- [API Documentation](backend/API_DOCUMENTATION.md)
- [Frontend README](mobile/README.md)
