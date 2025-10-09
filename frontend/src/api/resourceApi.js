import api from './axios';

// Base URL for the resource endpoints
const RESOURCE_URL = '/resources';

// --- File Upload ---
export const uploadResource = (formData) => {
  // Axios automatically sets 'Content-Type: multipart/form-data' for FormData objects
  return api.post(`${RESOURCE_URL}/upload`, formData);
};

// --- CRUD Operations ---
export const fetchAllResources = (params = {}) => {
  return api.get(RESOURCE_URL, { params });
};

export const fetchResourceById = (resourceId) => {
  return api.get(`${RESOURCE_URL}/${resourceId}`);
};

export const deleteResource = (resourceId) => {
  // Requires authentication (JWT header)
  return api.delete(`${RESOURCE_URL}/${resourceId}`);
};

// --- New Features ---
export const voteResource = (resourceId, voteType) => {
  return api.post(`${RESOURCE_URL}/${resourceId}/vote`, { voteType });
};

export const downloadResource = (resourceId) => {
  return api.post(`${RESOURCE_URL}/${resourceId}/download`);
};

export const fetchMyResources = () => {
  return api.get(`${RESOURCE_URL}/my/uploads`);
};

// --- Leaderboard API ---
export const fetchLeaderboard = (params = {}) => {
  return api.get('/leaderboard', { params });
};

export const fetchPlatformStats = () => {
  return api.get('/leaderboard/stats');
};