import api from '../lib/api';

class SuperAdminService {
  // Dashboard APIs
  async getDashboardStats() {
    try {
      const response = await api.get('/super-admin/dashboard-stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRecentActivities(limit = 10) {
    try {
      const response = await api.get(`/super-admin/recent-activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSystemMetrics() {
    try {
      const response = await api.get('/super-admin/system-metrics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User Management APIs
  async getAllUsers(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryString.append(key, value);
        }
      });

      const response = await api.get(`/super-admin/users?${queryString.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserStatistics() {
    try {
      const response = await api.get('/super-admin/users/statistics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserStatus(userId, statusData) {
    try {
      const response = await api.patch(`/super-admin/users/${userId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteUser(userId) {
    try {
      const response = await api.delete(`/super-admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createUser(userData) {
    try {
      const response = await api.post('/super-admin/users', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportUsersCSV() {
    try {
      const response = await api.get('/super-admin/users/export', {
        responseType: 'blob'
      });
      
      // Create and download the CSV file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Booking Management APIs
  async getAllBookings(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryString.append(key, value);
        }
      });

      const response = await api.get(`/super-admin/bookings?${queryString.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBookingStatistics() {
    try {
      const response = await api.get('/super-admin/bookings/statistics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBookingStatus(bookingId, statusData) {
    try {
      const response = await api.patch(`/super-admin/bookings/${bookingId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportBookingsCSV() {
    try {
      const response = await api.get('/super-admin/bookings/export', {
        responseType: 'blob'
      });
      
      // Create and download the CSV file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Analytics APIs
  async getAnalyticsData(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryString.append(key, value);
        }
      });

      const response = await api.get(`/super-admin/analytics?${queryString.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportAnalyticsReport(timeRange = '30d') {
    try {
      const response = await api.get(`/super-admin/analytics/export?timeRange=${timeRange}`, {
        responseType: 'blob'
      });
      
      // Create and download the report
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Profile Management
  async getProfile() {
    try {
      const response = await api.get('/super-admin/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.put('/super-admin/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await api.post('/super-admin/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // System Settings
  async getSystemSettings() {
    try {
      const response = await api.get('/super-admin/system-settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSystemSettings(settings) {
    try {
      const response = await api.put('/super-admin/system-settings', settings);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notification Settings
  async getNotificationSettings() {
    try {
      const response = await api.get('/super-admin/notification-settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateNotificationSettings(settings) {
    try {
      const response = await api.put('/super-admin/notification-settings', settings);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Security Settings
  async getSecuritySettings() {
    try {
      const response = await api.get('/super-admin/security-settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSecuritySettings(settings) {
    try {
      const response = await api.put('/super-admin/security-settings', settings);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error Handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return new Error(data?.message || `HTTP ${status}: Request failed`);
    } else if (error.request) {
      // Request made but no response received
      return new Error('Network error: Please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  async exportUsersCSV() {
    try {
      const response = await api.get('/super-admin/users/export', {
        responseType: 'blob'
      });
      
      // Create and download the CSV file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Booking Statistics
  async getBookingStatistics() {
    try {
      const response = await api.get('/super-admin/bookings/statistics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportBookingsCSV() {
    try {
      const response = await api.get('/super-admin/bookings/export', {
        responseType: 'blob'
      });
      
      // Create and download the CSV file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Profile Management
  async getProfile() {
    try {
      const response = await api.get('/super-admin/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.put('/super-admin/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await api.post('/super-admin/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notification Settings
  async getNotificationSettings() {
    try {
      const response = await api.get('/super-admin/notification-settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateNotificationSettings(settings) {
    try {
      const response = await api.put('/super-admin/notification-settings', settings);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Security Settings
  async getSecuritySettings() {
    try {
      const response = await api.get('/super-admin/security-settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSecuritySettings(settings) {
    try {
      const response = await api.put('/super-admin/security-settings', settings);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Analytics Export
  async exportAnalyticsReport(timeRange = '30d') {
    try {
      const response = await api.get(`/super-admin/analytics/export?timeRange=${timeRange}`, {
        responseType: 'blob'
      });
      
      // Create and download the report
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility functions
  formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  async getSystemMetrics() {
    try {
      const response = await api.get('/super-admin/system-metrics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User Management APIs
  async getAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.role && { role: params.role }),
        ...(params.status && { status: params.status }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder })
      }).toString();

      const response = await api.get(`/super-admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserStatus(userId, status, reason = '') {
    try {
      const response = await api.patch(`/super-admin/users/${userId}/status`, {
        status,
        reason
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteUser(userId) {
    try {
      const response = await api.delete(`/super-admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createUser(userData) {
    try {
      const response = await api.post('/super-admin/users', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Turf Admin Management APIs
  async getTurfAdmins(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status })
      }).toString();

      const response = await api.get(`/super-admin/turf-admins?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createTurfAdmin(adminData) {
    try {
      const response = await api.post('/super-admin/turf-admins', adminData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTurfAdminStatus(adminId, status, reason = '') {
    try {
      const response = await api.patch(`/super-admin/turf-admins/${adminId}/status`, {
        status,
        reason
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Booking Management APIs
  async getAllBookings(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder })
      }).toString();

      const response = await api.get(`/super-admin/bookings?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBookingStatus(bookingId, status, reason = '') {
    try {
      const response = await api.patch(`/super-admin/bookings/${bookingId}/status`, {
        status,
        reason
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBookingAnalytics(period = '30d') {
    try {
      const response = await api.get(`/super-admin/bookings/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Analytics APIs
  async getAnalyticsData(period = '30d') {
    try {
      const response = await api.get(`/super-admin/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Settings APIs
  async getSystemSettings() {
    try {
      const response = await api.get('/super-admin/settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSystemSettings(category, settings) {
    try {
      const response = await api.patch('/super-admin/settings', {
        category,
        settings
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notifications APIs
  async getNotifications(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/notifications?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.patch(`/super-admin/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // System Health APIs
  async getSystemHealth() {
    try {
      const response = await api.get('/super-admin/system-health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDatabaseStats() {
    try {
      const response = await api.get('/super-admin/database/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Export functionality
  async exportUsers(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/super-admin/export/users?${queryParams}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportBookings(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/super-admin/export/bookings?${queryParams}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportTurfAdmins(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/super-admin/export/turf-admins?${queryParams}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bulk Operations
  async bulkUpdateUsers(userIds, updateData) {
    try {
      const response = await api.patch('/super-admin/users/bulk-update', {
        userIds,
        updateData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkDeleteUsers(userIds) {
    try {
      const response = await api.delete('/super-admin/users/bulk-delete', {
        data: { userIds }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkUpdateBookings(bookingIds, updateData) {
    try {
      const response = await api.patch('/super-admin/bookings/bulk-update', {
        bookingIds,
        updateData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Real-time updates (WebSocket)
  async subscribeToRealTimeUpdates(callback) {
    // Implementation would depend on your WebSocket setup
    // For now, we'll return a placeholder
    return {
      unsubscribe: () => {
        console.log('Unsubscribed from real-time updates');
      }
    };
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          return new Error('Unauthorized. Please login again.');
        case 403:
          return new Error('Access denied. Insufficient permissions.');
        case 404:
          return new Error('Resource not found.');
        case 422:
          return new Error(data.message || 'Invalid data provided.');
        case 429:
          return new Error('Too many requests. Please try again later.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(data.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred.');
    }
  }

  // Utility methods
  formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(date).toLocaleDateString('en-IN', {
      ...defaultOptions,
      ...options
    });
  }

  getTimeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // New SuperAdmin Pages APIs
  
  // Turf Admin Management
  async getTurfAdmins(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/turf-admins?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async approveTurfAdmin(adminId) {
    try {
      const response = await api.patch(`/super-admin/turf-admins/${adminId}/approve`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectTurfAdmin(adminId, reason) {
    try {
      const response = await api.patch(`/super-admin/turf-admins/${adminId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Turfs Management
  async getAllTurfs(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/turfs?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async approveTurf(turfId) {
    try {
      const response = await api.patch(`/super-admin/turfs/${turfId}/approve`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectTurf(turfId, reason) {
    try {
      const response = await api.patch(`/super-admin/turfs/${turfId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Revenue Management
  async getRevenueStats(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/revenue/stats?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRevenueAnalytics(period = '30d') {
    try {
      const response = await api.get(`/super-admin/revenue/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // System Health
  async getSystemHealthMetrics() {
    try {
      const response = await api.get('/super-admin/system-health/metrics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getServiceStatus() {
    try {
      const response = await api.get('/super-admin/system-health/services');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notifications Management
  async getNotifications(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/notifications?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createNotification(notificationData) {
    try {
      const response = await api.post('/super-admin/notifications', notificationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendNotification(notificationId) {
    try {
      const response = await api.post(`/super-admin/notifications/${notificationId}/send`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/super-admin/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotificationStats() {
    try {
      const response = await api.get('/super-admin/notifications/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Database Management
  async getDatabaseTables() {
    try {
      const response = await api.get('/super-admin/database/tables');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDatabaseBackups() {
    try {
      const response = await api.get('/super-admin/database/backups');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createDatabaseBackup(backupData) {
    try {
      const response = await api.post('/super-admin/database/backup', backupData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async restoreDatabaseBackup(backupId) {
    try {
      const response = await api.post(`/super-admin/database/restore/${backupId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async downloadBackup(backupId) {
    try {
      const response = await api.get(`/super-admin/database/backup/${backupId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDatabaseQueries() {
    try {
      const response = await api.get('/super-admin/database/queries');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDatabasePerformance() {
    try {
      const response = await api.get('/super-admin/database/performance');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Email Management
  async getEmailCampaigns(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/emails/campaigns?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createEmailCampaign(campaignData) {
    try {
      const response = await api.post('/super-admin/emails/campaigns', campaignData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendEmailCampaign(campaignId) {
    try {
      const response = await api.post(`/super-admin/emails/campaigns/${campaignId}/send`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteEmailCampaign(campaignId) {
    try {
      const response = await api.delete(`/super-admin/emails/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEmailTemplates(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/emails/templates?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createEmailTemplate(templateData) {
    try {
      const response = await api.post('/super-admin/emails/templates', templateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteEmailTemplate(templateId) {
    try {
      const response = await api.delete(`/super-admin/emails/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEmailStats() {
    try {
      const response = await api.get('/super-admin/emails/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEmailAnalytics() {
    try {
      const response = await api.get('/super-admin/emails/analytics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Support Management
  async getSupportTickets(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/support/tickets?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTicketStatus(ticketId, status) {
    try {
      const response = await api.patch(`/super-admin/support/tickets/${ticketId}/status`, { status });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async assignTicket(ticketId, agentId) {
    try {
      const response = await api.patch(`/super-admin/support/tickets/${ticketId}/assign`, { agentId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async replyToTicket(ticketId, replyData) {
    try {
      const response = await api.post(`/super-admin/support/tickets/${ticketId}/reply`, replyData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSupportStats() {
    try {
      const response = await api.get('/super-admin/support/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSupportAnalytics() {
    try {
      const response = await api.get('/super-admin/support/analytics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // System Alerts
  async getSystemAlerts() {
    try {
      const response = await api.get('/super-admin/system-alerts');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // New SuperAdmin Pages APIs
  
  // Turf Admin Management
  async getTurfAdmins(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/turf-admins?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async approveTurfAdmin(adminId) {
    try {
      const response = await api.patch(`/super-admin/turf-admins/${adminId}/approve`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectTurfAdmin(adminId, reason) {
    try {
      const response = await api.patch(`/super-admin/turf-admins/${adminId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Turfs Management
  async getAllTurfs(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/turfs?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async approveTurf(turfId) {
    try {
      const response = await api.patch(`/super-admin/turfs/${turfId}/approve`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectTurf(turfId, reason) {
    try {
      const response = await api.patch(`/super-admin/turfs/${turfId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Revenue Management
  async getRevenueStats(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/revenue/stats?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRevenueAnalytics(period = '30d') {
    try {
      const response = await api.get(`/super-admin/revenue/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // System Health
  async getSystemHealthMetrics() {
    try {
      const response = await api.get('/super-admin/system-health/metrics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getServiceStatus() {
    try {
      const response = await api.get('/super-admin/system-health/services');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notifications Management
  async createNotification(notificationData) {
    try {
      const response = await api.post('/super-admin/notifications', notificationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendNotification(notificationId) {
    try {
      const response = await api.post(`/super-admin/notifications/${notificationId}/send`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/super-admin/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotificationStats() {
    try {
      const response = await api.get('/super-admin/notifications/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Database Management
  async getDatabaseTables() {
    try {
      const response = await api.get('/super-admin/database/tables');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDatabaseBackups() {
    try {
      const response = await api.get('/super-admin/database/backups');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createDatabaseBackup(backupData) {
    try {
      const response = await api.post('/super-admin/database/backup', backupData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async restoreDatabaseBackup(backupId) {
    try {
      const response = await api.post(`/super-admin/database/restore/${backupId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async downloadBackup(backupId) {
    try {
      const response = await api.get(`/super-admin/database/backup/${backupId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDatabaseQueries() {
    try {
      const response = await api.get('/super-admin/database/queries');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDatabasePerformance() {
    try {
      const response = await api.get('/super-admin/database/performance');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Email Management
  async getEmailCampaigns(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/emails/campaigns?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createEmailCampaign(campaignData) {
    try {
      const response = await api.post('/super-admin/emails/campaigns', campaignData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendEmailCampaign(campaignId) {
    try {
      const response = await api.post(`/super-admin/emails/campaigns/${campaignId}/send`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteEmailCampaign(campaignId) {
    try {
      const response = await api.delete(`/super-admin/emails/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEmailTemplates(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/emails/templates?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createEmailTemplate(templateData) {
    try {
      const response = await api.post('/super-admin/emails/templates', templateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteEmailTemplate(templateId) {
    try {
      const response = await api.delete(`/super-admin/emails/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEmailStats() {
    try {
      const response = await api.get('/super-admin/emails/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEmailAnalytics() {
    try {
      const response = await api.get('/super-admin/emails/analytics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Support Management
  async getSupportTickets(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/support/tickets?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTicketStatus(ticketId, status) {
    try {
      const response = await api.patch(`/super-admin/support/tickets/${ticketId}/status`, { status });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async assignTicket(ticketId, agentId) {
    try {
      const response = await api.patch(`/super-admin/support/tickets/${ticketId}/assign`, { agentId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async replyToTicket(ticketId, replyData) {
    try {
      const response = await api.post(`/super-admin/support/tickets/${ticketId}/reply`, replyData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSupportStats() {
    try {
      const response = await api.get('/super-admin/support/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSupportAnalytics() {
    try {
      const response = await api.get('/super-admin/support/analytics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // System Alerts
  async getSystemAlerts() {
    try {
      const response = await api.get('/super-admin/system-alerts');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Revenue Chart Data
  async getRevenueChartData(period = '30d') {
    try {
      const response = await api.get(`/super-admin/revenue/chart-data?period=${period}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Top Performing Turfs
  async getTopPerformingTurfs(period = '30d') {
    try {
      const response = await api.get(`/super-admin/turfs/top-performing?period=${period}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Recent Transactions
  async getRecentTransactions(limit = 10) {
    try {
      const response = await api.get(`/super-admin/transactions/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // System Services
  async getSystemServices() {
    try {
      const response = await api.get('/super-admin/system-health/services');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Performance History
  async getPerformanceHistory(period = '1h') {
    try {
      const response = await api.get(`/super-admin/system-health/performance?period=${period}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Turf Statistics
  async getTurfStats(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/turfs/statistics?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Turf Admin Statistics
  async getTurfAdminStats(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/super-admin/turf-admins/statistics?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cache management
  clearCache() {
    // Implementation for clearing local cache if you're using one
    console.log('Cache cleared');
  }
}

// Export singleton instance
export const superAdminService = new SuperAdminService();
export default superAdminService;