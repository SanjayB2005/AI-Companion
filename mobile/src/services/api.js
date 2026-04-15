import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';



const HOST_IP = '192.168.1.5'; 

// More flexible URL configuration
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    // Try actual IP first, fallback to emulator IP
    return `http://${HOST_IP}:8000/api`;
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:8000/api';
  } else {
    // Web and other platforms
    return 'http://localhost:8000/api';
  }
};

const BASE_URL = getBaseURL();

const getServiceHost = () => {
  if (Platform.OS === 'android') {
    return `http://${HOST_IP}`;
  }
  return 'http://localhost';
};

export const resolveSpeechAudioUrl = (audioUrl) => {
  if (!audioUrl) return null;
  if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
    return audioUrl;
  }

  const host = getServiceHost();
  if (audioUrl.startsWith('/static/')) {
    return `${host}:8002${audioUrl}`;
  }

  if (audioUrl.startsWith('/')) {
    return `${host}:8000${audioUrl}`;
  }

  return `${host}:8000/${audioUrl}`;
};

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

// Emotion API functions
export const emotionAPI = {
  startSession: async () => {
    try {
      const response = await api.post('/emotions/sessions/start/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  endSession: async (sessionId) => {
    try {
      const response = await api.post(`/emotions/sessions/${sessionId}/end/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  listSessions: async () => {
    try {
      const response = await api.get('/emotions/sessions/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  detectFacialEmotion: async (frameBase64, sessionId = null) => {
    try {
      const payload = { frame_base64: frameBase64 };
      if (sessionId) {
        payload.session_id = sessionId;
      }
      const response = await api.post('/emotions/detect/facial/', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export const speechAPI = {
  startSession: async (includeAudio = true) => {
    try {
      const response = await api.post('/speech/sessions/start/', { include_audio: includeAudio });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  endSession: async (sessionId) => {
    try {
      const response = await api.post(`/speech/sessions/${sessionId}/end/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  transcribeAudio: async (audioBase64, format = 'm4a', language = 'en') => {
    try {
      const response = await api.post('/speech/transcribe/', {
        audio_base64: audioBase64,
        format,
        language,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  generateResponse: async (
    userMessage,
    facialEmotion = 'Neutral',
    includeAudio = true,
    audioEmotion = 'neutral'
  ) => {
    try {
      const response = await api.post('/speech/generate-response/', {
        user_message: userMessage,
        detected_emotion: facialEmotion,
        facial_emotion: facialEmotion,
        audio_emotion: audioEmotion,
        include_audio: includeAudio,
      });

      const payload = response.data || {};
      return {
        ...payload,
        audio_url: resolveSpeechAudioUrl(payload.audio_url || payload.ai_audio_url),
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  synthesize: async (text, voiceRate = 175) => {
    try {
      const response = await api.post('/speech/synthesize/', {
        text,
        voice_rate: voiceRate,
      });

      const payload = response.data || {};
      return {
        ...payload,
        audio_url: resolveSpeechAudioUrl(payload.audio_url || payload.ai_audio_url),
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default api;