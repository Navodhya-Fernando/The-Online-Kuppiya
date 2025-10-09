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
        
        // CRITICAL FIX: Use try-catch to safely parse JSON and prevent app crash
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                // If stored data is corrupt (e.g., the string "undefined"), clear it
                console.error("Error parsing stored user data. Clearing storage:", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
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
        console.log('🔄 AuthContext: register function called');
        try {
            console.log('📤 AuthContext: calling registerUser API...');
            const response = await registerUser(userData);
            console.log('✅ AuthContext: registerUser successful', response);
            // For the new flow, we don't auto-login as the user needs approval
            // Just return the response which contains the registration status
            return response; 
        } catch (error) {
            console.error('❌ AuthContext: register error:', error);
            throw error;
        }
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