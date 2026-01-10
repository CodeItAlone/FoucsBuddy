import { useState, useCallback, useEffect } from 'react';
import { groupApi } from '../api';

/**
 * Custom hook for groups management.
 * Handles all group API calls with loading/error states.
 */
export function useGroups() {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGroups = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await groupApi.getMyGroups();
            setGroups(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch groups';
            setError(errorMessage);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getGroup = useCallback(async (groupId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await groupApi.getGroup(groupId);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch group';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createGroup = useCallback(async (name, category) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await groupApi.createGroup(name, category);
            setGroups(prev => [...prev, response.data]);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create group';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const joinGroup = useCallback(async (groupId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await groupApi.joinGroup(groupId);
            setGroups(prev => [...prev, response.data]);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to join group';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const leaveGroup = useCallback(async (groupId) => {
        setIsLoading(true);
        setError(null);
        try {
            await groupApi.leaveGroup(groupId);
            setGroups(prev => prev.filter(g => g.id !== groupId));
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to leave group';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        groups,
        isLoading,
        error,
        fetchGroups,
        getGroup,
        createGroup,
        joinGroup,
        leaveGroup,
    };
}

export default useGroups;
