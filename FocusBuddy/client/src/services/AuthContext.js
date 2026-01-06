import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { authApi, setAuthToken, clearAuthToken } from './api';

const AuthContext = createContext();

// Simple token storage for web (localStorage) and native (in-memory for now)
const tokenStorage = {
    getToken: async () => {
        if (Platform.OS === 'web') {
            return localStorage.getItem('focusbuddy_token');
        }
        // For native, we'd use SecureStore, but for MVP use in-memory
        return null;
    },
    setToken: async (token) => {
        if (Platform.OS === 'web') {
            localStorage.setItem('focusbuddy_token', token);
        }
    },
    getUser: async () => {
        if (Platform.OS === 'web') {
            const userData = localStorage.getItem('focusbuddy_user');
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    },
    setUser: async (user) => {
        if (Platform.OS === 'web') {
            localStorage.setItem('focusbuddy_user', JSON.stringify(user));
        }
    },
    clear: async () => {
        if (Platform.OS === 'web') {
            localStorage.removeItem('focusbuddy_token');
            localStorage.removeItem('focusbuddy_user');
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

            // Store token and user
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

            // Store token and user
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
