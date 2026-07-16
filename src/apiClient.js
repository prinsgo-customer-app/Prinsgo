import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // generous timeout for Render free-tier cold starts (can take 30-50s to wake up)
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('prinsgo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response received at all = can't reach the backend (wrong IP, backend not running, different WiFi, firewall)
    if (!error.response) {
      return Promise.reject(
        new Error(
          'Cannot reach the server. Check that: (1) your backend is running, (2) src/config.js has your computer\'s correct LAN IP (not localhost), (3) your phone and computer are on the same WiFi.'
        )
      );
    }
    const message =
      error.response?.data?.message || error.message || 'Something went wrong, please try again';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
