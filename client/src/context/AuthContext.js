import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Налаштування глобального конфігу axios
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }

    // Завантаження користувача при завантаженні сторінки
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await axios.get('/api/auth/me');
                    setUser(res.data);
                    setIsAuthenticated(true);
                } catch (err) {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false);
                    setError(err.response?.data?.message || 'Помилка автентифікації');
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    // Функція логіну
    const login = async (username, password) => {
        try {
            setLoading(true);
            const res = await axios.post('/api/auth/login', { username, password });

            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            setIsAuthenticated(true);
            setError(null);

            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка входу');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Функція виходу
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                loading,
                error,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};