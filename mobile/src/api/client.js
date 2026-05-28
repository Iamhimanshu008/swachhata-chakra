import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Try to auto-detect local IP if using Expo Dev Server
let BASE_URL = "https://smartwaste-ai-f0i9.onrender.com/api"; // Default (currently down)
const hostUri = Constants?.expoConfig?.hostUri;

if (hostUri) {
  // Extract IP from hostUri (e.g., 192.168.1.5:8081) and point to FastAPI backend on port 8000
  const ipAddress = hostUri.split(':')[0];
  BASE_URL = `http://${ipAddress}:8000/api`;
} else if (Platform.OS === 'android' && __DEV__) {
  BASE_URL = 'http://10.0.2.2:8000/api';
}

console.log('[SmartWaste] API BASE_URL:', BASE_URL);

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh token on 401 responses
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Only retry once, skip for login/refresh endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) return Promise.reject(error);

        const res = await fetch('https://smartwaste-ai-f0i9.onrender.com/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) return Promise.reject(error);

        const data = await res.json();
        await AsyncStorage.setItem('auth_token', data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return client(originalRequest);
      } catch (refreshError) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default client;

