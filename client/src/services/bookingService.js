import api from '../lib/api.js';

/**
 * Fetch bookings for the authenticated turf admin
 * @param {string} queryParams - URL query parameters for filtering
 * @returns {Promise<Array>} Array of booking objects
 */
export const fetchBookings = async (queryParams = '') => {
  try {
    const url = queryParams ? `/turfadmin/bookings?${queryParams}` : '/turfadmin/bookings';
    const response = await api.get(url);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
  }
};

/**
 * Fetch recent bookings for dashboard
 * @returns {Promise<Array>} Array of recent booking objects
 */
export const fetchRecentBookings = async () => {
  try {
    const response = await api.get('/turfadmin/bookings/recent');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch recent bookings');
  }
};

/**
 * Update booking status
 * @param {string} bookingId - The ID of the booking to update
 * @param {Object} statusData - Object containing the new status
 * @returns {Promise<Object>} Updated booking object
 */
export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    const response = await api.patch(`/turfadmin/bookings/${bookingId}/status`, statusData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw new Error(error.response?.data?.message || 'Failed to update booking status');
  }
};

/**
 * Export bookings as CSV
 * @param {string} queryParams - URL query parameters for filtering
 * @returns {Promise<string>} CSV data as string
 */
export const exportBookings = async (queryParams = '') => {
  try {
    const url = queryParams ? `/turfadmin/bookings/export?${queryParams}` : '/turfadmin/bookings/export';
    const response = await api.get(url, {
      responseType: 'text', // Expect CSV text response
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting bookings:', error);
    throw new Error(error.response?.data?.message || 'Failed to export bookings');
  }
};

/**
 * Create a new booking (for users)
 * @param {Object} bookingData - Booking data
 * @returns {Promise<Object>} Created booking object
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error(error.response?.data?.message || 'Failed to create booking');
  }
};

/**
 * Get bookings for the logged-in user
 * @returns {Promise<Array>} Array of user's booking objects
 */
export const getUserBookings = async () => {
  try {
    const response = await api.get('/bookings/user');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user bookings');
  }
};

/**
 * Get bookings by email (admin function)
 * @param {string} email - User email to search bookings for
 * @returns {Promise<Array>} Array of booking objects
 */
export const getBookingsByEmail = async (email) => {
  try {
    const response = await api.get(`/bookings?email=${encodeURIComponent(email)}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching bookings by email:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch bookings by email');
  }
};

/**
 * Cancel a booking
 * @param {string} bookingId - The ID of the booking to cancel
 * @returns {Promise<void>}
 */
export const cancelBooking = async (bookingId) => {
  try {
    await api.delete(`/bookings/${bookingId}`);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw new Error(error.response?.data?.message || 'Failed to cancel booking');
  }
};