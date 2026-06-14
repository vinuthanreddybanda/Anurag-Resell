import axios from 'axios';

// Set up default axios client
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Inject JWT token into headers if logged in
api.interceptors.request.use(
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

// Response interceptor: Standardize errors and intercept 401s
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if token expired or user got banned/unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are in the browser, redirect to login page if appropriate
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && !window.location.pathname.includes('/verify-email')) {
        window.location.href = '/login';
      }
    }
    
    // Extract server message if available
    const message = 
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'An unexpected error occurred. Please try again.';
        
    return Promise.reject(new Error(message));
  }
);

export default api;
