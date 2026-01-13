import client from '../client';

export const analyticsApi = {
    getDailySummary: (date) => client.get('/analytics/daily-summary', { params: { date } }),
};
