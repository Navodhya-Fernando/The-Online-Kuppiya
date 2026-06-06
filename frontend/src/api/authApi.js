// navodhya-fernando/the-online-kuppiya/The-Online-Kuppiya-5966a041738e121b3133724b3e1bf39b3e882014/frontend/src/api/authApi.js

import api from './axios';

const AUTH_URL = '/auth';

export const registerUser = (userData) => {
  return api.post(`${AUTH_URL}/register`, userData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const loginUser = (credentials) => {
  return api.post(`${AUTH_URL}/login`, credentials);
};

export const logoutUser = async () => {
  // Client-side token removal only (API call removed in AuthContext)
};

export const verifyEmail = (token) => {
  return api.get(`${AUTH_URL}/verify-email/${token}`);
};

export const resendVerificationEmail = (email) => {
  return api.post(`${AUTH_URL}/resend-verification`, { email });
};

export const forgotPassword = (email) => {
  return api.post(`${AUTH_URL}/forgot-password`, { email });
};

export const resetPassword = (token, password) => {
  return api.post(`${AUTH_URL}/reset-password/${token}`, { password });
};

// Admin functions
export const getPendingUsers = () => {
  return api.get(`${AUTH_URL}/pending-users`);
};

export const approveUser = (userId) => {
  return api.put(`${AUTH_URL}/approve/${userId}`); // FIX: Matches backend route
};

export const rejectUser = (userId, reason) => {
  return api.delete(`${AUTH_URL}/reject/${userId}`, { data: { reason } }); // FIX: Matches backend route
};

export const getUserProfile = () => {
  return api.get(`${AUTH_URL}/profile`);
};

export const updateUserProfile = (profileData) => {
  return api.put(`${AUTH_URL}/profile`, profileData);
};