import apiClient, { getAuthToken } from '../client';

export const sessionApi = {
    // POST /api/sessions/start - Start a new focus session
    // NOTE: Overriding baseURL to point to /api/sessions/start (skipping /v1)
    start: (task, duration, sessionType = 'FOCUS') => {
        // Construct the correct base URL depending on environment
        const useLocal = apiClient.defaults.baseURL.includes('localhost');
        const apiRoot = useLocal ? 'http://localhost:8080/api' : 'http://10.0.2.2:8080/api';

        // DEBUG: Log token status
        const token = getAuthToken();
        console.log('SESSION START: Token available:', !!token);
        console.log('SESSION START: Token prefix:', token ? token.substring(0, 20) + '...' : 'null');
        console.log('SESSION START: Request URL:', apiRoot + '/sessions/start');

        return apiClient.post('/sessions/start',
            { task, duration, sessionType },
            { baseURL: apiRoot } // Override baseURL to remove /v1
        );
    },

    // Alias for backwards compatibility
    create: (task, duration) => apiClient.post('/sessions', { task, duration, sessionType: 'FOCUS' }),

    // GET /sessions - Get all sessions for the user
    getAll: () => apiClient.get('/sessions'),

    // GET /sessions/current - Get the active session (if any)
    getCurrent: () => apiClient.get('/sessions/current'),

    // GET /sessions/{id} - Get a specific session
    getById: (sessionId) => apiClient.get(`/sessions/${sessionId}`),

    // POST /sessions/{id}/pause - Pause session
    pause: (sessionId) => apiClient.post(`/sessions/${sessionId}/pause`),

    // POST /sessions/{id}/resume - Resume session
    resume: (sessionId) => apiClient.post(`/sessions/${sessionId}/resume`),

    // POST /sessions/{id}/end - End session (complete or abandon)
    end: (sessionId, reflection, status) =>
        apiClient.post(`/sessions/${sessionId}/end`, { reflection, status }),

    // POST /sessions/{id}/distractions - Add a distraction log
    addDistraction: (sessionId, description) =>
        apiClient.post(`/sessions/${sessionId}/distractions`, { description }),

    // GET /sessions/summary?date=YYYY-MM-DD
    getDailySummary: (date) => apiClient.get('/sessions/summary', { params: { date } }),
};

export default sessionApi;

