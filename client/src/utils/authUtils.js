import { clearAuthData } from './tokenUtils.js';

/**
 * Clear all authentication data and force re-login
 * Use this when there are token signature issues
 */
export const forceReLogin = () => {
  console.log('Clearing authentication data due to token issues...');
  clearAuthData();
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/**
 * Check if current stored token is valid format
 */
export const isTokenFormatValid = (token) => {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    return parts.length === 3; // JWT should have 3 parts
  } catch (error) {
    return false;
  }
};

/**
 * Development utility to clear tokens when signature issues occur
 */
export const handleTokenSignatureError = () => {
  console.warn('Token signature error detected. This usually happens when:');
  console.warn('1. JWT secret was changed on the server');
  console.warn('2. Token was corrupted');
  console.warn('3. Token was created with different secret');
  console.warn('Clearing stored authentication data...');
  
  forceReLogin();
};