// Utility functions for JWT token handling

/**
 * Check if a JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - true if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode JWT payload (without verification - just for expiry check)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000;
    
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true; // Assume expired if we can't parse it
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Authentication data cleared from localStorage');
};

/**
 * Force clear all localStorage (for debugging)
 */
export const forceCleanAuth = () => {
  localStorage.clear();
  console.log('All localStorage cleared');
  window.location.reload();
};

/**
 * Get valid token from localStorage or null if invalid/expired
 */
export const getValidToken = () => {
  const token = localStorage.getItem('token');
  
  if (!token || isTokenExpired(token)) {
    if (token) {
      console.log('Token found but expired, clearing auth data');
      clearAuthData();
    }
    return null;
  }
  
  return token;
};