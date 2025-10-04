import api from '../lib/api.js';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Object containing token, user data, and loginTime
 */
export const loginRequest = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    const data = response.data;
    
    // Store login time for session management
    const loginTime = new Date().toISOString();
    
    // Return consistent structure
    return {
      token: data.token,
      user: data.user || data.data,
      loginTime,
    };
  } catch (error) {
    console.error('Login request failed:', error);
    throw error;
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @param {string} userData.confirmPassword - Password confirmation
 * @param {string} userData.phone - User's phone number (optional)
 * @returns {Promise<Object>} Registration response data
 */
export const registerRequest = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration request failed:', error);
    throw error;
  }
};

/**
 * Get current authenticated user data
 * @returns {Promise<Object>} Current user data
 */
export const meRequest = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user || response.data.data || response.data;
  } catch (error) {
    console.error('Get current user request failed:', error);
    throw error;
  }
};

/**
 * Refresh user token (if refresh endpoint exists)
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New token data
 */
export const refreshTokenRequest = async (refreshToken) => {
  try {
    const response = await api.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    console.error('Token refresh request failed:', error);
    throw error;
  }
};

/**
 * Forgot password request
 * @param {string} email - User email
 * @returns {Promise<Object>} Response data
 */
export const forgotPasswordRequest = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  } catch (error) {
    console.error('Forgot password request failed:', error);
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} password - New password
 * @param {string} confirmPassword - Password confirmation
 * @returns {Promise<Object>} Response data
 */
export const resetPasswordRequest = async (token, password, confirmPassword) => {
  try {
    const response = await api.post('/auth/reset-password', {
      token,
      password,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Reset password request failed:', error);
    throw error;
  }
};

/**
 * Change password for authenticated user
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - New password confirmation
 * @returns {Promise<Object>} Response data
 */
export const changePasswordRequest = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const response = await api.patch('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Change password request failed:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfileRequest = async (profileData) => {
  try {
    const response = await api.patch('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Update profile request failed:', error);
    throw error;
  }
};

/**
 * Verify email with token
 * @param {string} token - Email verification token
 * @returns {Promise<Object>} Response data
 */
export const verifyEmailRequest = async (token) => {
  try {
    const response = await api.post('/auth/verify-email', {
      token,
    });
    return response.data;
  } catch (error) {
    console.error('Email verification request failed:', error);
    throw error;
  }
};

/**
 * Resend email verification
 * @param {string} email - User email
 * @returns {Promise<Object>} Response data
 */
export const resendVerificationRequest = async (email) => {
  try {
    const response = await api.post('/auth/resend-verification', {
      email,
    });
    return response.data;
  } catch (error) {
    console.error('Resend verification request failed:', error);
    throw error;
  }
};