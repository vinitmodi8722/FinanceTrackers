import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Decode JWT token just to check if it's there or validate from backend
            // Normally you'd hit a '/api/auth/me' endpoint, but since we just have token & user inside login response
            // For simplicity we will assume token presence means logged in.
            // Make sure axios gets the auth header
            axios.defaults.headers.common['x-auth-token'] = token;

            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            // Set axios header immediately before state update
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            return true;
        } catch (err) {
            console.error(err);
            throw err.response?.data?.message || 'Login failed';
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
            // Set axios header immediately before state update
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            return true;
        } catch (err) {
            console.error(err);
            throw err.response?.data?.message || 'Registration failed';
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
