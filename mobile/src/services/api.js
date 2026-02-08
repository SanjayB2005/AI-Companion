import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Base URL - Auto-detect platform
// Android Emulator: http://10.0.2.2:8000/api
// iOS Simulator: http://localhost:8000/api
// Web: http://localhost:8000/api
// Physical Device: Use your computer's local IP

// For physical device testing, get your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
const HOST_IP = '192.168.1.4'; // Your computer's actual IP address

const BASE_URL = Platform.select({
  android: `http://${HOST_IP}:8000/api`, // Try actual IP for Android (works for both emulator and physical device)
  ios: 'http://localhost:8000/api',
  default: 'http://localhost:8000/api', // web and others
});

console.log('Platform:', Platform.OS);
console.log('API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds for slower connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Auth token attached');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    // Log error details
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} - ${error.response.config.url}`, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error: No response received', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }

    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (refreshToken) {
          console.log('🔄 Attempting to refresh token...');
          // Try to refresh the token
          const response = await axios.post(`${BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          
          // Save new access token
          await AsyncStorage.setItem('access_token', access);
          console.log('✅ Token refreshed successfully');
          
          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Refresh token is invalid or expired
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
        // Optionally: navigate to login screen
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.username);
      const response = await api.post('/auth/register/', userData);
      const { tokens, user } = response.data;
      
      console.log('✅ Registration successful for user:', user.username);
      
      // Save tokens and user data
      await AsyncStorage.multiSet([
        ['access_token', tokens.access],
        ['refresh_token', tokens.refresh],
        ['user_data', JSON.stringify(user)],
      ]);
      
      console.log('💾 Tokens and user data saved successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error.message);
      if (error.response) {
        console.error('Response error:', error.response.data);
      } else if (error.request) {
        console.error('No response received - Backend may not be running');
      }
      throw error.response?.data || error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('🔐 Attempting login with:', { email: credentials.email });
      const response = await api.post('/auth/login/', credentials);
      const { tokens, user } = response.data;
      
      console.log('✅ Login successful for user:', user.username);
      
      // Save tokens and user data
      await AsyncStorage.multiSet([
        ['access_token', tokens.access],
        ['refresh_token', tokens.refresh],
        ['user_data', JSON.stringify(user)],
      ]);
      
      console.log('💾 Tokens and user data saved successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      if (error.response) {
        console.error('Response error:', error.response.data);
      } else if (error.request) {
        console.error('No response received - Backend may not be running');
      }
      throw error.response?.data || error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
      
      // Clear all stored data
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
      
      return { message: 'Logged out successfully' };
    } catch (error) {
      // Clear storage even if API call fails
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
      throw error.response?.data || error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile/');
      
      // Update stored user data
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.patch('/auth/profile/update/', userData);
      
      // Update stored user data
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password/', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete account
  deleteAccount: async (password) => {
    try {
      const response = await api.delete('/auth/delete/', { data: { password } });
      
      // Clear all stored data
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post(`${BASE_URL}/token/refresh/`, {
        refresh: refreshToken,
      });
      
      const { access } = response.data;
      await AsyncStorage.setItem('access_token', access);
      
      return response.data;
    } catch (error) {
      // Clear tokens if refresh fails
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
      throw error.response?.data || error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },

  // Get stored user data
  getUserData: async () => {
    const userData = await AsyncStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      console.log('📧 Requesting password reset for:', email);
      const response = await api.post('/auth/password-reset/request/', { email });
      console.log('✅ Password reset code sent');
      return response.data;
    } catch (error) {
      console.error('❌ Password reset request failed:', error.message);
      throw error.response?.data || error;
    }
  },

  // Confirm password reset with code
  confirmPasswordReset: async (resetData) => {
    try {
      console.log('🔐 Confirming password reset for:', resetData.email);
      const response = await api.post('/auth/password-reset/confirm/', resetData);
      console.log('✅ Password reset successful');
      return response.data;
    } catch (error) {
      console.error('❌ Password reset confirmation failed:', error.message);
      throw error.response?.data || error;
    }
  },
};

export default api;