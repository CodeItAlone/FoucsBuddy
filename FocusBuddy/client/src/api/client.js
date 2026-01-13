import axios from 'axios';
import { Platform } from 'react-native';

// Use localhost for Web, 10.0.2.2 for Android Emulator
const BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:8080/api/v1'
    : 'http://10.0.2.2:8080/api/v1';


const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token storage
let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
};

export const clearAuthToken = () => {
    authToken = null;
};

export const getAuthToken = () => authToken;

// Request interceptor to add auth header
apiClient.interceptors.request.use(
    (config) => {
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuthToken();
        }
        return Promise.reject(error);
    }
);

export default apiClient;
