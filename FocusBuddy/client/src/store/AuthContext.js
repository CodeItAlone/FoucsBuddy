import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { authApi, setAuthToken, clearAuthToken } from '../api';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();

const TOKEN_KEY = 'focusbuddy_token';
const USER_KEY = 'focusbuddy_user';

// Token storage - uses SecureStore for native, localStorage for web
const tokenStorage = {
    getToken: async () => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(TOKEN_KEY);
        }
        try {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        } catch (e) {
            console.error('Error getting token from SecureStore:', e);
            return null;
        }
    },
    setToken: async (token) => {
        if (Platform.OS === 'web') {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            try {
                await SecureStore.setItemAsync(TOKEN_KEY, token);
            } catch (e) {
                console.error('Error saving token to SecureStore:', e);
            }
        }
    },
    getUser: async () => {
        if (Platform.OS === 'web') {
            const userData = localStorage.getItem(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        }
        try {
            const userData = await SecureStore.getItemAsync(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            console.error('Error getting user from SecureStore:', e);
            return null;
        }
    },
    setUser: async (user) => {
        if (Platform.OS === 'web') {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } else {
            try {
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
            } catch (e) {
                console.error('Error saving user to SecureStore:', e);
            }
        }
    },
    clear: async () => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } else {
            try {
                await SecureStore.deleteItemAsync(TOKEN_KEY);
                await SecureStore.deleteItemAsync(USER_KEY);
            } catch (e) {
                console.error('Error clearing SecureStore:', e);
            }
        }
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const loadStoredAuth = async () => {
            try {
                const token = await tokenStorage.getToken();
                const storedUser = await tokenStorage.getUser();
                if (token && storedUser) {
                    setAuthToken(token);
                    setUser(storedUser);
                }
            } catch (e) {
                console.error("Error loading stored auth:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStoredAuth();
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.login(email, password);
            const { token, user: userData } = response.data;

            await tokenStorage.setToken(token);
            await tokenStorage.setUser(userData);
            setAuthToken(token);
            setUser(userData);

            return true;
        } catch (e) {
            console.error("Login failed", e);
            const message = e.response?.data?.message ||
                (e.response?.status === 401 ? "Invalid credentials" : "Login failed");
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (email, handle, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.signup(email, handle, password);
            const { token, user: userData } = response.data;

            await tokenStorage.setToken(token);
            await tokenStorage.setUser(userData);
            setAuthToken(token);
            setUser(userData);

            return true;
        } catch (e) {
            console.error("Signup failed", e);
            const message = e.response?.data?.message ||
                e.response?.data?.errors?.email ||
                e.response?.data?.errors?.handle ||
                e.response?.data?.errors?.password ||
                "Signup failed. Please try again.";
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await tokenStorage.clear();
        clearAuthToken();
        setUser(null);
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            error,
            login,
            signup,
            logout,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
