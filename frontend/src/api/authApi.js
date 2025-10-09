import api from './axios';

const AUTH_URL = '/auth';

export const registerUser = (userData) => {
  // userData is now FormData for file upload
  return api.post(`${AUTH_URL}/register`, userData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const loginUser = (credentials) => {
  return api.post(`${AUTH_URL}/login`, credentials);
};

export const logoutUser = () => {
  return api.get(`${AUTH_URL}/logout`);
};

export const getCurrentUser = () => {
  return api.get(`${AUTH_URL}/me`);
};

// OTP functions removed - using student ID verification instead

// Password reset functions
export const forgotPassword = (method, identifier) => {
  return api.post(`${AUTH_URL}/forgot-password`, { method, identifier });
};

export const resetPassword = (token, password) => {
  return api.post(`${AUTH_URL}/reset-password/${token}`, { password });
};

// Admin functions
export const getPendingUsers = () => {
  return api.get(`${AUTH_URL}/pending-users`);
};

export const approveUser = (userId) => {
  return api.put(`${AUTH_URL}/approve-user/${userId}`);
};

export const rejectUser = (userId, reason) => {
  return api.put(`${AUTH_URL}/reject-user/${userId}`, { reason });
};