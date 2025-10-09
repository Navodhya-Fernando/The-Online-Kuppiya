import axios from 'axios';

// Create a custom Axios instance
const api = axios.create({
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api