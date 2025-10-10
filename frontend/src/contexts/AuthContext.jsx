import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../api/authApi';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to clear authentication data
    const clearAuthData = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        console.log('Checking auth data:', { 
            hasUser: !!storedUser, 
            hasToken: !!storedToken,
            userPreview: storedUser ? storedUser.substring(0, 50) + '...' : null
        });
        
        // Only set user if both user data and token exist
        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Validate token format (basic check)
                if (storedToken.length > 10) {
                    setUser(parsedUser);
                } else {
                    console.warn("Invalid token format. Clearing storage.");
                    clearAuthData();
                }
            } catch (error) {
                console.error("Error parsing stored user data. Clearing storage:", error);
                clearAuthData();
            }
        } else if (storedUser || storedToken) {
            // If only one exists, clear both to maintain consistency
            console.warn("Inconsistent auth data. Clearing storage.");
            clearAuthData();
        }
        
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const response = await loginUser(credentials);
        const { user, token } = response.data;
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token); 
        
        setUser(user);
        return response;
    };

    const register = async (userData) => {
        try {
            const response = await registerUser(userData);
            // Don't automatically log in users who need approval
            if (response.data.requiresApproval) {
                return {
                    success: true,
                    requiresApproval: true,
                    message: response.data.message,
                    user: response.data.user
                };
            } else if (response.data.token) {
                // Auto-login for approved users
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('token', response.data.token);
                setUser(response.data.user);
                return { success: true, requiresApproval: false };
            }
            return { success: true };
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        // We only perform client-side cleanup for JWTs.
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (updatedUserData) => {
        const newUserData = { ...user, ...updatedUserData };
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
        clearAuthData, // Expose this function for manual clearing
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};