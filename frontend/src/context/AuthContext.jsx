import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUserStr = localStorage.getItem('user');
            
            if (token && savedUserStr) {
                try {
                    const savedUser = JSON.parse(savedUserStr);
                    setUser(savedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("Failed to parse user from local storage");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            
            const { token, refreshToken, username: responseUsername } = response.data;
            const userData = { username: responseUsername || username };
            
            localStorage.setItem('token', token);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Login failed, please check your credentials';
            return { success: false, message };
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await api.post('/auth/register', { username, email, password });
            
            // Assuming successful registration directly logs in, or we just want to login after saving tokens.
            if (response.data && response.data.token) {
                 const { token, refreshToken, username: responseUsername } = response.data;
                 const userData = { username: responseUsername || username };
                 
                 localStorage.setItem('token', token);
                 if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
                 localStorage.setItem('user', JSON.stringify(userData));
                 
                 setUser(userData);
                 setIsAuthenticated(true);
            }
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            const message = error.response?.data?.message || 'Registration failed';
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
