import apiClient from '../client';

export const sessionApi = {
    // POST /sessions - Create a new focus session
    create: (task, duration) => apiClient.post('/sessions', { task, duration }),

    // GET /sessions - Get all sessions for the user
    getAll: () => apiClient.get('/sessions'),

    // GET /sessions/current - Get the active session (if any)
    getCurrent: () => apiClient.get('/sessions/current'),

    // GET /sessions/{id} - Get a specific session
    getById: (sessionId) => apiClient.get(`/sessions/${sessionId}`),

    // PATCH /sessions/{id} - Update session (complete or abandon)
    update: (sessionId, status, reflection = null) =>
        apiClient.patch(`/sessions/${sessionId}`, { status, reflection }),

    // POST /sessions/{id}/distractions - Add a distraction log
    addDistraction: (sessionId, description) =>
        apiClient.post(`/sessions/${sessionId}/distractions`, { description }),
};

export default sessionApi;

