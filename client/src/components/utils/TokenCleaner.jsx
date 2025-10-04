import React from 'react';

/**
 * Programmatically clear all authentication data
 */
const clearAllAuthData = () => {
  console.log('🔄 Clearing all authentication data...');
  
  // Clear specific auth items
  const authKeys = ['token', 'user', 'authData', 'refreshToken', 'loginTime'];
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Clear any other auth-related items
  Object.keys(localStorage).forEach(key => {
    if (key.toLowerCase().includes('auth') || 
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('jwt')) {
      localStorage.removeItem(key);
    }
  });
  
  Object.keys(sessionStorage).forEach(key => {
    if (key.toLowerCase().includes('auth') || 
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('jwt')) {
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('✅ All authentication data cleared');
};

const TokenCleaner = () => {
  React.useEffect(() => {
    // Immediate check on mount
    const performImmediateCleanup = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Check JWT structure
          const parts = token.split('.');
          if (parts.length !== 3) {
            console.warn('� Malformed JWT detected, clearing...');
            clearAllAuthData();
            window.location.href = '/login';
            return;
          }

          // Check for expired token
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < currentTime) {
            console.warn('⏰ Expired token detected, clearing...');
            clearAllAuthData();
            window.location.href = '/login';
            return;
          }
        } catch (error) {
          console.warn('🔧 Invalid token format, clearing...', error);
          clearAllAuthData();
          window.location.href = '/login';
          return;
        }
      }
      
      // Check for auth errors from API calls
      const lastError = sessionStorage.getItem('lastAuthError');
      if (lastError === '401' || lastError === 'invalid_signature') {
        console.warn('� Auth error detected, clearing all data...');
        clearAllAuthData();
        sessionStorage.removeItem('lastAuthError');
        window.location.href = '/login';
        return;
      }
    };
    
    // Run immediate cleanup
    performImmediateCleanup();
    
    // Set up periodic background check (every 30 seconds)
    const interval = setInterval(performImmediateCleanup, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // This component renders nothing visible
  return null;
};

export default TokenCleaner;