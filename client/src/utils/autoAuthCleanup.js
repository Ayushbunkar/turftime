/**
 * Automatic Authentication Cleanup Utility
 * Runs on app startup to detect and fix JWT signature issues
 */

const AUTO_CLEANUP_KEY = 'auth_auto_cleanup_ran';

export const runAutoAuthCleanup = () => {
  // Check if we've already run cleanup today
  const lastCleanup = localStorage.getItem(AUTO_CLEANUP_KEY);
  const today = new Date().toDateString();
  
  if (lastCleanup === today) {
    console.log('🔍 Auto cleanup already ran today');
    return;
  }

  console.log('🚀 Running automatic auth cleanup...');
  
  try {
    // Check for potentially invalid tokens
    const token = localStorage.getItem('token');
    
    if (token) {
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('🔧 Invalid JWT structure detected, clearing...');
        clearAllAuthData();
        return;
      }
      
      try {
        // Try to decode the payload (without verification)
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Check if token is expired
        if (payload.exp && payload.exp < currentTime) {
          console.warn('⏰ Expired token detected, clearing...');
          clearAllAuthData();
          return;
        }
        
        // Check if token is too old (more than 7 days)
        if (payload.iat && (currentTime - payload.iat) > (7 * 24 * 60 * 60)) {
          console.warn('📅 Very old token detected, clearing...');
          clearAllAuthData();
          return;
        }
        
      } catch (decodeError) {
        console.warn('🔧 Cannot decode token, clearing...', decodeError);
        clearAllAuthData();
        return;
      }
    }
    
    // Mark cleanup as completed
    localStorage.setItem(AUTO_CLEANUP_KEY, today);
    console.log('✅ Auto cleanup completed successfully');
    
  } catch (error) {
    console.error('❌ Error during auto cleanup:', error);
    // If there's any error, clear everything to be safe
    clearAllAuthData();
  }
};

const clearAllAuthData = () => {
  console.log('🧹 Clearing all authentication data...');
  
  // Clear specific auth items
  const authKeys = ['token', 'user', 'authData', 'refreshToken', 'loginTime', 'userLocation'];
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
  
  console.log('🎯 All authentication data cleared');
};