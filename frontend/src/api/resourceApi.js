import api from './axios';

// Base URL for the resource endpoints
const RESOURCE_URL = '/resources';

// --- File Upload ---
export const uploadResource = (formData) => {
  // Axios automatically sets 'Content-Type: multipart/form-data' for FormData objects
  return api.post(`${RESOURCE_URL}/upload`, formData);
};

// --- CRUD Operations ---
export const fetchAllResources = () => {
  return api.get(RESOURCE_URL);
};

export const fetchResourceById = (resourceId) => {
  return api.get(`${RESOURCE_URL}/${resourceId}`);
};

export const deleteResource = (resourceId) => {
  // Requires authentication (JWT header)
  return api.delete(`${RESOURCE_URL}/${resourceId}`);
};