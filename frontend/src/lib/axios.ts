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

// Configure axios base URL to use the proxy
axios.defaults.baseURL = '/api';

export default axios;
