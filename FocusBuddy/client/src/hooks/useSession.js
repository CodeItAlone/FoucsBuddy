import { useState, useCallback } from 'react';
import { sessionApi } from '../api';

/**
 * Custom hook for session management.
 * Handles all session API calls with loading/error states.
 */
export function useSession() {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const start = useCallback(async (task, duration) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await sessionApi.start(task, duration);
            setSession(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to start session';
            setError(errorMessage);
            // Return a local session ID to allow offline functionality
            const localSession = { id: `local-${Date.now()}`, status: 'ACTIVE', taskDescription: task, plannedDuration: duration };
            setSession(localSession);
            return localSession;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const complete = useCallback(async (sessionId, reflection = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await sessionApi.complete(sessionId, reflection);
            setSession(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to complete session';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const abandon = useCallback(async (sessionId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await sessionApi.abandon(sessionId);
            setSession(null);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to abandon session';
            setError(errorMessage);
            // Clear session locally even if API fails
            setSession(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getActive = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await sessionApi.getActive();
            setSession(response.data || null);
            return response.data;
        } catch (err) {
            if (err.response?.status !== 204) {
                setError(err.message);
            }
            setSession(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearSession = useCallback(() => {
        setSession(null);
        setError(null);
    }, []);

    return {
        session,
        isLoading,
        error,
        start,
        complete,
        abandon,
        getActive,
        clearSession,
    };
}

export default useSession;
