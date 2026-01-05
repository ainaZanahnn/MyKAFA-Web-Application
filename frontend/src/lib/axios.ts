import axios from 'axios';

// Create a centralized Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000, // 10 seconds timeout
});

// Configure axios to include authentication token in all requests
apiClient.interceptors.request.use(
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

// Response interceptor for error handling with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log errors for debugging, but skip for token verification to avoid noise during initialization
    const isVerifyRequest = error.config?.url?.includes('/auth/verify');
    if (!isVerifyRequest) {
      console.error('API Error:', error);
    }

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      if (!isVerifyRequest) {
        console.error(`HTTP ${status} Error:`, data);
      }

      // Retry logic for rate limiting (429) errors
      if (status === 429 && !error.config._retry) {
        error.config._retry = true;
        const retryDelay = Math.random() * 2000 + 1000; // Random delay between 1-3 seconds
        console.log(`Rate limited. Retrying in ${retryDelay}ms...`);

        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return apiClient(error.config);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
