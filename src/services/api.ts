import axios from 'axios';

// Define base API URL
const API_URL = 'https://localhost/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Important for cookies/CSRF
});

// Response interceptor for handling errors globally
/*api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors by redirecting to login
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);*/

export default api; 