import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Read from .env (EXPO_PUBLIC_API_URL) with production fallback
const BASE_URL = process.env.EXPO_PUBLIC_API_URL
  ? `${process.env.EXPO_PUBLIC_API_URL}/api`
  : 'https://smartwaste-ai-f0i9.onrender.com/api';

console.log('[Swachhata Chakra] API BASE_URL:', BASE_URL);

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
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

export default client;
