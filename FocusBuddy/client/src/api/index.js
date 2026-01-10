// Re-export all API endpoints for convenience
export { default as apiClient, setAuthToken, clearAuthToken, getAuthToken } from './client';
export { authApi } from './endpoints/auth';
export { sessionApi } from './endpoints/sessions';
export { streakApi } from './endpoints/streaks';

