import axios from 'axios';

// Configure axios to include authentication token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Base URL is handled by Vite proxy in development
// In production, it will use the same domain

export default axios;
