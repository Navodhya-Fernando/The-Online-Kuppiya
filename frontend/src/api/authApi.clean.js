import axiosInstance from './axios';

export const registerUser = (userData) => {
    return axiosInstance.post('/auth/register', userData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const loginUser = (credentials) => {
    return axiosInstance.post('/auth/login', credentials);
};

export const logoutUser = () => {
    return axiosInstance.post('/auth/logout');
};

export const getUserProfile = () => {
    return axiosInstance.get('/auth/profile');
};

export const getPendingUsers = () => {
    return axiosInstance.get('/auth/pending-users');
};

export const approveUser = (userId) => {
    return axiosInstance.put(`/auth/approve-user/${userId}`);
};

export const rejectUser = (userId, reason) => {
    return axiosInstance.put(`/auth/reject-user/${userId}`, { reason });
};
