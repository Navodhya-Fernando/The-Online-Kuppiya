import api from './axios';

const AUTH_URL = '/auth';

export const registerUser = (userData) => {
  return api.post(`${AUTH_URL}/register`, userData);
};

export const loginUser = (credentials) => {
  return api.post(`${AUTH_URL}/login`, credentials);
};

export const logoutUser = () => {
  // Typically a GET request that clears the session/cookie on the server
  return api.get(`${AUTH_URL}/logout`);
};