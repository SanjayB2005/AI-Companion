# Emotion Companion Backend - API Endpoints

## Base URL
```
http://localhost:8000/api/
```

## Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register/`

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "password_confirm": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "profile_picture": null,
    "date_joined": "2026-02-08T10:00:00Z",
    "last_login": null
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "message": "User registered successfully"
}
```

---

### 2. Login User
**POST** `/api/auth/login/`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "profile_picture": null,
    "date_joined": "2026-02-08T10:00:00Z",
    "last_login": "2026-02-08T10:30:00Z"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "message": "Login successful"
}
```

---

### 3. Logout User
**POST** `/api/auth/logout/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (205 Reset Content):**
```json
{
  "message": "Logout successful"
}
```

---

### 4. Get User Profile
**GET** `/api/auth/profile/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "profile_picture": "http://localhost:8000/media/profile_pictures/photo.jpg",
  "date_joined": "2026-02-08T10:00:00Z",
  "last_login": "2026-02-08T10:30:00Z"
}
```

---

### 5. Update User Profile
**PUT/PATCH** `/api/auth/profile/update/`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data (if uploading profile picture)
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "profile_picture": "<file>"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Smith",
    "full_name": "John Smith",
    "profile_picture": "http://localhost:8000/media/profile_pictures/photo.jpg",
    "date_joined": "2026-02-08T10:00:00Z",
    "last_login": "2026-02-08T10:30:00Z"
  },
  "message": "Profile updated successfully"
}
```

---

### 6. Change Password
**POST** `/api/auth/change-password/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "old_password": "oldpassword123",
  "new_password": "newpassword123",
  "new_password_confirm": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

---

### 7. Delete Account
**DELETE** `/api/auth/delete/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "password": "password123"
}
```

**Response (204 No Content):**
```json
{
  "message": "Account deleted successfully"
}
```

---

## JWT Token Management

### 1. Obtain Token Pair
**POST** `/api/token/`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 2. Refresh Access Token
**POST** `/api/token/refresh/`

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 3. Verify Token
**POST** `/api/token/verify/`

**Request Body:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "field_name": [
    "Error message"
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "error": "Account is disabled"
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

---

## Frontend Integration

### React Native Axios Configuration

```javascript
// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://10.0.2.2:8000/api/',  // Android emulator
  // baseURL: 'http://localhost:8000/api/',  // iOS simulator
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        const response = await axios.post(
          'http://10.0.2.2:8000/api/token/refresh/',
          { refresh: refreshToken }
        );
        
        const { access } = response.data;
        await AsyncStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh token expired, logout user
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        // Navigate to login screen
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### Usage Examples

```javascript
import api from './services/api';

// Register
const register = async (userData) => {
  const response = await api.post('auth/register/', userData);
  return response.data;
};

// Login
const login = async (credentials) => {
  const response = await api.post('auth/login/', credentials);
  const { tokens } = response.data;
  await AsyncStorage.setItem('access_token', tokens.access);
  await AsyncStorage.setItem('refresh_token', tokens.refresh);
  return response.data;
};

// Get Profile
const getProfile = async () => {
  const response = await api.get('auth/profile/');
  return response.data;
};

// Update Profile
const updateProfile = async (profileData) => {
  const response = await api.patch('auth/profile/update/', profileData);
  return response.data;
};
```
