import axios from 'axios';
import { Platform } from 'react-native';

// Use localhost for Web, 10.0.2.2 for Android Emulator
const BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:8080/api'
    : 'http://10.0.2.2:8080/api';

// WebSocket URL for real-time updates
export const WS_URL = Platform.OS === 'web'
    ? 'http://localhost:8080/ws'
    : 'http://10.0.2.2:8080/ws';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token storage (will be set by AuthContext)
let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
};

export const clearAuthToken = () => {
    authToken = null;
};

export const getAuthToken = () => authToken;

// Request interceptor to add auth header
api.interceptors.request.use(
    (config) => {
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear token
            clearAuthToken();
            // The AuthContext will handle redirect to login
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    signup: (email, handle, password) => api.post('/auth/signup', { email, handle, password }),
};

export const sessionApi = {
    start: (task, duration) => api.post('/sessions/start', { task, duration }),
    complete: (sessionId, reflection) => api.post(`/sessions/${sessionId}/complete`, { reflection }),
    abandon: (sessionId) => api.post(`/sessions/${sessionId}/abandon`, {}),
    getActive: () => api.get('/sessions/active'),
    getHistory: () => api.get('/sessions/history'),
};

export const groupApi = {
    getMyGroups: () => api.get('/groups'),
    getGroup: (groupId) => api.get(`/groups/${groupId}`),
    getMemberStatuses: (groupId) => api.get(`/groups/${groupId}/members/status`),
    createGroup: (name, category) => api.post('/groups', { name, category }),
    joinGroup: (groupId) => api.post(`/groups/${groupId}/join`),
    leaveGroup: (groupId) => api.post(`/groups/${groupId}/leave`),
};

export const streakApi = {
    getMyStreak: () => api.get('/streaks/me'),
};

export default api;

