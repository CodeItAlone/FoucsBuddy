import apiClient from '../client';

export const sessionApi = {
    // POST /sessions - Create/start a new focus session
    // Note: Backend expects { task, duration, sessionType }
    start: (task, duration, sessionType = 'FOCUS') =>
        apiClient.post('/sessions', { task, duration, sessionType }),

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

