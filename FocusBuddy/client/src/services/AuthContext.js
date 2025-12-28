import React, { createContext, useState, useContext } from 'react';
import { authApi } from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.login(email, password);
            setUser(response.data);
            return true;
        } catch (e) {
            console.error("Login failed", e);
            setError(e.response?.status === 401 ? "Invalid credentials" : "Login failed");
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
            setUser(response.data);
            return true;
        } catch (e) {
            console.error("Signup failed", e);
            setError(e.response?.data || "Signup failed. Email or Handle might be taken.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, error, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
