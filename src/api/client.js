import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useStore from '../store';

const BASE_URL = 'https://smartwaste-ai-f0i9.onrender.com/api';

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
    timeout: 15000,
});

// Request interceptor: attach JWT token from AsyncStorage or Zustand
client.interceptors.request.use(async (config) => {
    try {
        let token = useStore.getState().token;
        if (!token) {
            token = await AsyncStorage.getItem('auth_token');
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (_) { }
    return config;
});

// Response interceptor: handle 401
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('auth_user');
            useStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default client;
