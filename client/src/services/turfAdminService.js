import api from '../lib/api.js';

/**
 * Fetch all turfs for the authenticated turf admin
 * @returns {Promise<Array>} Array of turf objects
 */
export const fetchTurfs = async () => {
  try {
    console.log('🔄 Fetching turfs for TurfAdmin...');
    
    // Try debug endpoint first
    try {
      const debugResponse = await api.get('/debug/turfs');
      console.log('🔍 TurfAdmin Debug response:', debugResponse.data);
    } catch (debugError) {
      console.log('⚠️ Debug endpoint failed for TurfAdmin:', debugError.message);
    }
    
    const response = await api.get('/turfadmin/turfs');
    console.log('📊 Turf admin service response:', response.data);
    
    // Handle different response formats
    if (response.data.status === 'success') {
      const turfs = response.data.data || [];
      console.log(`✅ TurfAdmin: Loaded ${turfs.length} turfs`);
      return turfs;
    }
    
    const fallback = Array.isArray(response.data) ? response.data : [];
    console.log(`📋 TurfAdmin: Fallback loaded ${fallback.length} turfs`);
    return fallback;
  } catch (error) {
    console.error('❌ Error fetching turfs in TurfAdmin:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch turfs');
  }
};

/**
 * Create a new turf
 * @param {FormData} turfData - Turf data including images
 * @returns {Promise<Object>} Created turf object
 */
export const createTurf = async (turfData) => {
  try {
    const response = await api.post('/turfadmin/turfs', turfData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating turf:', error);
    
    // Handle specific error cases
    if (error.response?.status === 413) {
      throw new Error('Files are too large. Please compress your images and try again.');
    } else if (error.response?.data?.message) {
      // Check if it's a file size error
      const message = error.response.data.message;
      if (message.toLowerCase().includes('file') && message.toLowerCase().includes('large')) {
        throw new Error('One or more files are too large. Maximum file size is 25MB per image.');
      }
      throw new Error(message);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timeout. Please check your internet connection and try again.');
    } else {
      throw new Error('Failed to create turf. Please try again.');
    }
  }
};

/**
 * Update an existing turf
 * @param {string} turfId - The ID of the turf to update
 * @param {FormData} turfData - Updated turf data
 * @returns {Promise<Object>} Updated turf object
 */
export const updateTurf = async (turfId, turfData) => {
  try {
    const response = await api.put(`/turfadmin/turfs/${turfId}`, turfData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating turf:', error);
    
    // Handle specific error cases
    if (error.response?.status === 413) {
      throw new Error('Files are too large. Please compress your images and try again.');
    } else if (error.response?.data?.message) {
      // Check if it's a file size error
      const message = error.response.data.message;
      if (message.toLowerCase().includes('file') && message.toLowerCase().includes('large')) {
        throw new Error('One or more files are too large. Maximum file size is 25MB per image.');
      }
      throw new Error(message);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timeout. Please check your internet connection and try again.');
    } else {
      throw new Error('Failed to update turf. Please try again.');
    }
  }
};

/**
 * Delete a turf
 * @param {string} turfId - The ID of the turf to delete
 * @returns {Promise<void>}
 */
export const deleteTurf = async (turfId) => {
  try {
    await api.delete(`/turfadmin/turfs/${turfId}`);
  } catch (error) {
    console.error('Error deleting turf:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete turf');
  }
};

/**
 * Get dashboard data for turf admin
 * @returns {Promise<Object>} Dashboard data including stats and recent activity
 */
export const getDashboardData = async () => {
  try {
    const response = await api.get('/turfadmin/dashboard');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
  }
};

/**
 * Get stats for turf admin
 * @returns {Promise<Object>} Statistical data
 */
export const getStats = async () => {
  try {
    const response = await api.get('/turfadmin/stats');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch stats');
  }
};