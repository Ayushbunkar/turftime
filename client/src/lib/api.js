import axios from 'axios';
import { getValidToken, clearAuthData } from '../utils/tokenUtils.js';

// Create axios instance with better debugging
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4500/api',
});

// Add request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = getValidToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for auth handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🚨 401 Unauthorized - token invalid or expired');
      
      // Mark this error for TokenCleaner to detect
      sessionStorage.setItem('lastAuthError', '401');
      
      // Clear auth data
      clearAuthData();
      
      // If we're not already on login page, redirect there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.log('🔄 Redirecting to login due to auth failure');
        window.location.href = '/login?reason=auth_failed';
      }
    }
    
    // Check for specific JWT signature errors
    if (error.response?.data?.message?.includes('invalid signature') || 
        error.message?.includes('invalid signature')) {
      console.warn('🚨 JWT signature error detected');
      sessionStorage.setItem('lastAuthError', 'invalid_signature');
    }
    
    return Promise.reject(error);
  }
);

export default api;
