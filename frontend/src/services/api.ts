import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      console.warn('[API 401] Error on URL:', url);
      // Don't redirect on auth endpoints - let the component handle it
      if (!url.includes('/auth/login') && 
          !url.includes('/auth/register') && 
          !url.includes('/auth/me')) {
        // Only clear storage and redirect if token exists (expired token scenario)
        const token = localStorage.getItem('token');
        if (token) {
          console.error('[API] Clearing token due to 401 on', url);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Use a timeout to avoid race conditions with other state updates
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
