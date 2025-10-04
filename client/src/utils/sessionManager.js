/**
 * Session Persistence Utilities
 * Manages user session data and dashboard preferences
 */

const SESSION_KEYS = {
  LAST_DASHBOARD: 'lastDashboard',
  USER_PREFERENCES: 'userPreferences',
  DASHBOARD_HISTORY: 'dashboardHistory'
};

export class SessionManager {
  
  /**
   * Save the current dashboard for the user's role
   * @param {string} role - User role
   * @param {string} path - Dashboard path
   */
  static saveLastDashboard(role, path) {
    if (!role || !path) return;
    
    try {
      localStorage.setItem(`${SESSION_KEYS.LAST_DASHBOARD}_${role}`, path);
      
      // Also maintain a history of visited dashboards
      this.addToDashboardHistory(role, path);
    } catch (error) {
      console.warn('Could not save dashboard preference:', error);
    }
  }

  /**
   * Get the last visited dashboard for a user role
   * @param {string} role - User role
   * @returns {string|null} - Last dashboard path or null
   */
  static getLastDashboard(role) {
    if (!role) return null;
    
    try {
      return localStorage.getItem(`${SESSION_KEYS.LAST_DASHBOARD}_${role}`);
    } catch (error) {
      console.warn('Could not retrieve dashboard preference:', error);
      return null;
    }
  }

  /**
   * Add dashboard to visit history
   * @param {string} role - User role
   * @param {string} path - Dashboard path
   */
  static addToDashboardHistory(role, path) {
    try {
      const historyKey = `${SESSION_KEYS.DASHBOARD_HISTORY}_${role}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      // Remove if already exists to avoid duplicates
      const filteredHistory = history.filter(item => item.path !== path);
      
      // Add new entry at the beginning
      filteredHistory.unshift({
        path,
        timestamp: Date.now(),
        visitCount: (history.find(item => item.path === path)?.visitCount || 0) + 1
      });

      // Keep only last 10 entries
      const limitedHistory = filteredHistory.slice(0, 10);
      
      localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
    } catch (error) {
      console.warn('Could not save dashboard history:', error);
    }
  }

  /**
   * Get dashboard visit history for a role
   * @param {string} role - User role
   * @returns {Array} - Dashboard history array
   */
  static getDashboardHistory(role) {
    try {
      const historyKey = `${SESSION_KEYS.DASHBOARD_HISTORY}_${role}`;
      return JSON.parse(localStorage.getItem(historyKey) || '[]');
    } catch (error) {
      console.warn('Could not retrieve dashboard history:', error);
      return [];
    }
  }

  /**
   * Save user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - User preferences object
   */
  static saveUserPreferences(userId, preferences) {
    if (!userId || !preferences) return;
    
    try {
      const key = `${SESSION_KEYS.USER_PREFERENCES}_${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      const updated = { ...existing, ...preferences };
      
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.warn('Could not save user preferences:', error);
    }
  }

  /**
   * Get user preferences
   * @param {string} userId - User ID
   * @returns {Object} - User preferences object
   */
  static getUserPreferences(userId) {
    if (!userId) return {};
    
    try {
      const key = `${SESSION_KEYS.USER_PREFERENCES}_${userId}`;
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch (error) {
      console.warn('Could not retrieve user preferences:', error);
      return {};
    }
  }

  /**
   * Clear all session data for a user
   * @param {string} role - User role
   * @param {string} userId - User ID
   */
  static clearUserSession(role, userId) {
    try {
      if (role) {
        localStorage.removeItem(`${SESSION_KEYS.LAST_DASHBOARD}_${role}`);
        localStorage.removeItem(`${SESSION_KEYS.DASHBOARD_HISTORY}_${role}`);
      }
      
      if (userId) {
        localStorage.removeItem(`${SESSION_KEYS.USER_PREFERENCES}_${userId}`);
      }
    } catch (error) {
      console.warn('Could not clear user session:', error);
    }
  }

  /**
   * Get the most frequently visited dashboard for a role
   * @param {string} role - User role
   * @returns {string|null} - Most visited dashboard path
   */
  static getMostVisitedDashboard(role) {
    try {
      const history = this.getDashboardHistory(role);
      
      if (history.length === 0) return null;
      
      // Sort by visit count (descending) and get the most visited
      const sortedByVisits = history.sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0));
      
      return sortedByVisits[0]?.path || null;
    } catch (error) {
      console.warn('Could not determine most visited dashboard:', error);
      return null;
    }
  }

  /**
   * Validate if a dashboard path is appropriate for a role
   * @param {string} path - Dashboard path
   * @param {string} role - User role
   * @returns {boolean} - Whether the path is valid for the role
   */
  static isValidDashboardForRole(path, role) {
    const roleBasedPaths = {
      user: ['/user-dashboard', '/user/'],
      admin: ['/super-admin/', '/admin/'],
      superAdmin: ['/super-admin/', '/admin/'],
      turfAdmin: ['/turfadmin']
    };

    const allowedPaths = roleBasedPaths[role] || [];
    return allowedPaths.some(allowedPath => path.startsWith(allowedPath));
  }
}

export default SessionManager;