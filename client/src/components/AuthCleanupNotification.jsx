import React, { useState, useEffect } from 'react';

const AuthCleanupNotification = () => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check URL parameters for cleanup reasons
    const urlParams = new URLSearchParams(window.location.search);
    const reason = urlParams.get('reason');
    
    if (reason) {
      let msg = '';
      switch (reason) {
        case 'token_expired':
          msg = '🔄 Your session expired. Please login again.';
          break;
        case 'auth_failed':
          msg = '🔒 Authentication failed. Please login again.';
          break;
        case 'manual_clear':
          msg = '🧹 Authentication data cleared successfully.';
          break;
        default:
          msg = '🔐 Please login to continue.';
      }
      
      setMessage(msg);
      setShow(true);
      
      // Auto hide after 5 seconds
      setTimeout(() => setShow(false), 5000);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{message}</span>
          <button 
            onClick={() => setShow(false)}
            className="ml-4 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthCleanupNotification;