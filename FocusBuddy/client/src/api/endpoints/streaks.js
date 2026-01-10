import apiClient from '../client';

export const streakApi = {
    getMyStreak: () => apiClient.get('/streaks/me'),
};

export default streakApi;
