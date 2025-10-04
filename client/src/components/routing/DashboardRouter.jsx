import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SessionManager from '../../utils/sessionManager';

/**
 * Centralized Dashboard Router Component
 * Automatically redirects users to their appropriate dashboard based on role
 * Remembers last visited dashboard for better UX
 */
const DashboardRouter = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Save current dashboard to session manager for persistence
  useEffect(() => {
    if (user && location.pathname !== '/dashboard') {
      SessionManager.saveLastDashboard(user.role, location.pathname);
    }
  }, [location.pathname, user]);

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Get appropriate dashboard path based on user role
  const getDashboardPath = (userRole) => {
    // Try to get the last visited dashboard
    const lastDashboard = SessionManager.getLastDashboard(userRole);
    
    // Try to get the most frequently visited dashboard as fallback
    const mostVisited = SessionManager.getMostVisitedDashboard(userRole);
    
    // Default dashboards for each role
    const defaultDashboards = {
      user: '/user-dashboard',
      admin: '/super-admin/dashboard',
      superAdmin: '/super-admin/dashboard', 
      turfAdmin: '/turfadmin'
    };

    // Priority: last visited -> most visited -> default
    if (lastDashboard && SessionManager.isValidDashboardForRole(lastDashboard, userRole)) {
      return lastDashboard;
    }
    
    if (mostVisited && SessionManager.isValidDashboardForRole(mostVisited, userRole)) {
      return mostVisited;
    }
    
    return defaultDashboards[userRole] || '/';
  };

  const redirectPath = getDashboardPath(user.role);

  return <Navigate to={redirectPath} replace />;
};

export default DashboardRouter;