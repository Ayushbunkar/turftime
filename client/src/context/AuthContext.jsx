import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api'; // kept for any incidental direct calls
import { loginRequest, registerRequest, meRequest } from '../services/authService';
import { getValidToken, clearAuthData } from '../utils/tokenUtils';
import toast from 'react-hot-toast';

// Create context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getValidToken()); // Use validated token
  const [loading, setLoading] = useState(true);

  // Set up axios defaults when token changes
  // Authorization header handled in api interceptor
  useEffect(() => {}, [token]);

  // Fetch user data with the token
  useEffect(() => {
    const fetchUserData = async () => {
      // Re-validate token on each effect run
      const validToken = getValidToken();
      
      if (!validToken) {
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Update token state if it was cleaned up
      if (validToken !== token) {
        setToken(validToken);
      }
      
      try {
        const u = await meRequest();
        setUser(u);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        // For any error (including 401), clear auth data to be safe
        clearAuthData();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we think we have a valid token
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const { token: tk, user: u, loginTime } = await loginRequest(email, password);
      localStorage.setItem('token', tk);
      setToken(tk);
      setUser(u);
      
      // Enhanced welcome message
      const welcomeMessage = u.lastLogin 
        ? `Welcome back, ${u.name}!` 
        : `Welcome to TurfTime, ${u.name}!`;
      
      toast.success(welcomeMessage);
      return u;
    } catch (err) {
      const errorData = err.response?.data;
      const message = errorData?.message || 'Login failed';
      
      // Handle specific error codes for better user experience
      switch (errorData?.code) {
        case 'ACCOUNT_LOCKED':
        case 'ACCOUNT_LOCKED_MAX_ATTEMPTS':
          toast.error(message, { duration: 6000 });
          break;
        case 'ACCOUNT_INACTIVE':
        case 'ACCOUNT_SUSPENDED':
          toast.error(message, { duration: 8000 });
          break;
        case 'USER_NOT_FOUND':
          toast.error('No account found with this email address');
          break;
        case 'INVALID_CREDENTIALS':
          toast.error(message);
          break;
        default:
          toast.error(message);
      }
      
      throw err;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const data = await registerRequest(userData);
      toast.success('Registration successful! Please log in.');
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Update user function (for profile updates)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Logout function
  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
    
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};