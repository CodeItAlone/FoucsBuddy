import apiClient from '../client';

export const authApi = {
    login: (email, password) => apiClient.post('/auth/login', { email, password }),
    signup: (email, handle, password) => apiClient.post('/auth/signup', { email, handle, password }),
};

export default authApi;
