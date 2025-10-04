import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Enhanced Protected Route Component
 * Handles authentication, authorization, and role-based access control
 * 
 * @param {React.Component} element - Component to render if authorized
 * @param {string} requiredRole - Single required role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 * @param {string} redirectTo - Where to redirect if unauthorized (default: '/login')
 */
const ProtectedRoute = ({ 
  element, 
  requiredRole, 
  allowedRoles, 
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Effect to show toast on authorization failure
  useEffect(() => {
    if (!loading && user && (requiredRole || allowedRoles)) {
      console.log('ProtectedRoute Debug:', {
        userRole: user.role,
        requiredRole,
        allowedRoles,
        pathname: location.pathname
      });
      
      let isAuthorized = false;
      if (requiredRole) {
        isAuthorized = user.role === requiredRole;
      }
      if (!isAuthorized && allowedRoles && allowedRoles.length > 0) {
        isAuthorized = allowedRoles.includes(user.role);
      }

      if (!isAuthorized) {
        console.log('Authorization failed:', {
          userRole: user.role,
          requiredRole,
          allowedRoles,
          isAuthorized
        });
        
        // Check if user will be redirected to their role-based dashboard
        const roleBasedRedirects = {
          user: '/user-dashboard',
          admin: '/super-admin/dashboard',
          superadmin: '/super-admin/dashboard',
          turfadmin: '/turfadmin'
        };
        
        const hasRoleDashboard = roleBasedRedirects[user.role];
        
        // Only show toast if user won't be redirected to their own dashboard
        // This prevents "Access denied" toasts during role-based redirects
        if (!hasRoleDashboard) {
          toast.error(`Access denied. User has ${user.role} role but requires ${requiredRole || allowedRoles?.join(' or ')} role.`);
        }
      }
    }
  }, [loading, user, requiredRole, allowedRoles, location.pathname]);

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    // Store the attempted URL for redirect after login
    const redirectUrl = `${location.pathname}${location.search}`;
    return <Navigate to={`${redirectTo}?redirect=${encodeURIComponent(redirectUrl)}`} replace />;
  }

  // If no authentication required and no user, render the element
  if (!requireAuth && !user) {
    return element;
  }

  // Check role-based authorization
  if (user && (requiredRole || allowedRoles)) {
    let isAuthorized = false;

    // Check single required role
    if (requiredRole) {
      isAuthorized = user.role === requiredRole;
    }

    // Check multiple allowed roles
    if (allowedRoles && allowedRoles.length > 0) {
      isAuthorized = allowedRoles.includes(user.role);
    }

    // If not authorized, redirect
    if (!isAuthorized) {
      // Redirect to appropriate dashboard based on user's actual role
      const roleBasedRedirects = {
        user: '/user-dashboard',
        admin: '/super-admin/dashboard',
        superadmin: '/super-admin/dashboard',
        turfadmin: '/turfadmin'
      };

      const userDashboard = roleBasedRedirects[user.role] || '/';
      return <Navigate to={userDashboard} replace />;
    }
  }

  // User is authenticated and authorized - render the protected element
  return element;
};

export default ProtectedRoute;