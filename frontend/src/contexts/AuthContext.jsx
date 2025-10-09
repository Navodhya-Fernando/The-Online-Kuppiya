import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../api/authApi';

// Create the Context object
const AuthContext = createContext(null);

// Custom hook to use the auth context easily
export const useAuth = () => {
    return useContext(AuthContext);
};

// Provider component to wrap the application
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for user/token in local storage on initial load
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Function to handle user login
    const login = async (credentials) => {
        const response = await loginUser(credentials);
        const { user, token } = response.data;
        
        // Store user and token
        localStorage.setItem('user', JSON.stringify(user));
        // You'll need to update the axios interceptor in api/axios.js to use this token
        localStorage.setItem('token', token); 
        
        setUser(user);
        return response;
    };

    // Function to handle user registration
    const register = async (userData) => {
        const response = await registerUser(userData);
        // Typically logs the user in automatically after successful registration
        return login(userData); 
    };

    // Function to handle user logout
    const logout = async () => {
        await logoutUser();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};