import axios from 'axios';

// Use localhost for Web, 10.0.2.2 for Android Emulator
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:8080/api'
    : 'http://10.0.2.2:8080/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password: password }),
    signup: (email, handle, password) => api.post('/auth/signup', { email, handle, password: password }),
};

export const sessionApi = {
    start: (userId, task, duration) => api.post('/sessions/start', { userId, task, duration }),
    complete: (sessionId, reflection) => api.post(`/sessions/${sessionId}/complete`, { reflection }),
    abandon: (sessionId) => api.post(`/sessions/${sessionId}/abandon`, {}),
};

export default api;
