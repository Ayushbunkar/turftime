/**
 * Convert degrees to radians
 * @param {number} value - Value in degrees
 * @returns {number} Value in radians
 */
function toRad(value) {
  return (value * Math.PI) / 180;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number|null} Distance in kilometers or null if invalid coordinates
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null;
  }

  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Get count of available time slots
 * @param {Array} timeSlots - Array of time slot objects
 * @returns {number} Count of available slots
 */
export function getAvailableSlotsCount(timeSlots) {
  if (!Array.isArray(timeSlots)) {
    return 0;
  }

  return timeSlots.filter(slot => slot.available !== false && !slot.booked).length;
}

/**
 * Check if turf has any available slots
 * @param {Array} timeSlots - Array of time slot objects
 * @returns {boolean} True if turf has available slots
 */
export function hasAvailableSlots(timeSlots) {
  if (!Array.isArray(timeSlots)) {
    return false;
  }

  return timeSlots.some(slot => slot.available !== false && !slot.booked);
}

/**
 * Format price in Indian Rupees
 * @param {number} price - Price to format
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  if (!price || isNaN(price)) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Calculate total price for cart items
 * @param {Array} cartItems - Array of cart item objects
 * @returns {number} Total price
 */
export function calculateCartTotal(cartItems) {
  if (!Array.isArray(cartItems)) {
    return 0;
  }

  return cartItems.reduce((total, item) => {
    const itemPrice = item.price || 0;
    const quantity = item.quantity || 1;
    const duration = item.duration || 1;
    
    return total + (itemPrice * quantity * duration);
  }, 0);
}

/**
 * Opens Google Maps directions from user's current location to the given destination.
 * Prompts user for location permission if needed.
 * @param {{lat: number, lng: number}} destination
 */
export function openGoogleMapsDirections(destination) {
  if (
    !destination ||
    typeof destination.lat !== "number" ||
    typeof destination.lng !== "number" ||
    isNaN(destination.lat) ||
    isNaN(destination.lng)
  ) {
    alert("Turf location is not available.");
    return;
  }

  if ("geolocation" in navigator) {
    const getDirections = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destination.lat},${destination.lng}`,
            "_blank"
          );
        },
        (error) => {
          alert("Error fetching your location: " + error.message);
        }
      );
    };

    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          getDirections();
        } else if (result.state === "prompt") {
          if (window.confirm("This feature needs your location to show directions. Allow access?")) {
            getDirections();
          }
        } else {
          alert("Location permission denied. Please enable location access in your browser settings.");
        }
      });
    } else {
      if (window.confirm("This feature needs your location to show directions. Allow access?")) {
        getDirections();
      }
    }
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

/**
 * Share turf details using Web Share API or clipboard
 * @param {Object} turf - Turf object to share
 */
export function shareTurf(turf) {
  if (!turf) {
    alert("No turf data to share");
    return;
  }

  const shareData = {
    title: turf.name || "Turf Booking",
    text: `Check out ${turf.name || "this turf"} - ₹${turf.price || 0}/hour`,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch((error) => {
      console.log("Error sharing:", error);
    });
  } else {
    // Fallback to clipboard
    const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert("Turf details copied to clipboard!");
      }).catch(() => {
        alert("Unable to copy to clipboard");
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert("Turf details copied to clipboard!");
      } catch (err) {
        alert("Unable to copy to clipboard");
      }
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Get directions to a turf
 * @param {Object} turf - Turf object with coordinates
 */
export function getDirections(turf) {
  if (!turf || (!turf.latitude && !turf.lat) || (!turf.longitude && !turf.lng)) {
    alert("Turf location is not available.");
    return;
  }

  const lat = turf.latitude || turf.lat;
  const lng = turf.longitude || turf.lng;
  
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, "_blank");
}

/**
 * Toggle favorite status of a turf
 * @param {string} turfId - ID of the turf
 * @param {Array} favorites - Current favorites array
 * @param {Function} setFavorites - Function to update favorites
 */
export function toggleFavorite(turfId, favorites, setFavorites) {
  const newFavorites = favorites.includes(turfId)
    ? favorites.filter((id) => id !== turfId)
    : [...favorites, turfId];
  
  setFavorites(newFavorites);
  localStorage.setItem("favoriteTurfs", JSON.stringify(newFavorites));
  
  return newFavorites;
}

/**
 * Filter turfs based on search criteria
 * @param {Array} turfs - Array of turf objects
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Filter object
 * @returns {Array} Filtered turfs
 */
export function filterTurfs(turfs, searchTerm = "", filters = {}) {
  if (!Array.isArray(turfs)) {
    return [];
  }

  let filtered = [...turfs];

  // Apply search filter
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (turf) =>
        turf.name?.toLowerCase().includes(term) ||
        turf.address?.toLowerCase().includes(term) ||
        turf.surface?.toLowerCase().includes(term) ||
        turf.amenities?.some(amenity => amenity.toLowerCase().includes(term))
    );
  }

  // Apply other filters
  if (filters.surface && filters.surface !== "all") {
    filtered = filtered.filter(turf => turf.surface?.toLowerCase() === filters.surface.toLowerCase());
  }

  if (filters.maxPrice) {
    filtered = filtered.filter(turf => (turf.price || 0) <= filters.maxPrice);
  }

  if (filters.minRating) {
    filtered = filtered.filter(turf => (turf.rating || 0) >= filters.minRating);
  }

  if (filters.availableOnly) {
    filtered = filtered.filter(turf => hasAvailableSlots(turf.timeSlots));
  }

  return filtered;
}

/**
 * Extract user role from JWT token
 * @param {string} token - JWT token
 * @returns {string|null} User role or null if invalid
 */
export function extractRoleFromToken(token) {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || payload.userType || null;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

/**
 * Check if user has required role
 * @param {string} userRole - Current user's role
 * @param {string|Array} requiredRole - Required role(s)
 * @returns {boolean} True if user has required role
 */
export function hasRequiredRole(userRole, requiredRole) {
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole.toLowerCase());
  }
  
  return userRole.toLowerCase() === requiredRole.toLowerCase();
}

/**
 * Check if user role has hierarchical access to required role
 * @param {string} userRole - Current user's role
 * @param {string} requiredRole - Required role
 * @returns {boolean} True if user has access based on role hierarchy
 */
export function hasHierarchicalAccess(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  
  // Updated role hierarchy - higher roles can access lower role endpoints
  const roleHierarchy = {
    'superadmin': ['superAdmin', 'admin', 'turfAdmin', 'user'], // SuperAdmin can access all
    'admin': ['admin', 'turfAdmin', 'user'], // Admin can access admin, turfAdmin and user endpoints
    'turfadmin': ['turfAdmin', 'user'], // TurfAdmin can access turfAdmin and user endpoints
    'user': ['user'] // User can only access user endpoints
  };
  
  const userRoleLower = userRole.toLowerCase();
  const requiredRoleLower = requiredRole.toLowerCase();
  
  // Check if user's role allows access to required role
  return roleHierarchy[userRoleLower]?.includes(requiredRoleLower) || false;
}

/**
 * Enhanced role checking with hierarchy support
 * @param {string} userRole - Current user's role
 * @param {string|Array} requiredRole - Required role(s)
 * @param {boolean} useHierarchy - Whether to use role hierarchy (default: true)
 * @returns {boolean} True if user has required access
 */
export function hasRequiredRoleEnhanced(userRole, requiredRole, useHierarchy = true) {
  if (!userRole) return false;
  
  // Strict role checking - turfadmin should only access turfadmin endpoints
  if (Array.isArray(requiredRole)) {
    return requiredRole.some(role => 
      useHierarchy ? hasHierarchicalAccess(userRole, role) : userRole.toLowerCase() === role.toLowerCase()
    );
  }
  
  return useHierarchy ? 
    hasHierarchicalAccess(userRole, requiredRole) : 
    userRole.toLowerCase() === requiredRole.toLowerCase();
}

/**
 * Handle API access denied errors
 * @param {Object} error - Error object from API
 * @returns {string} User-friendly error message
 */
export function handleAccessDenied(error) {
  const message = error?.message || error?.data?.message || 'Access denied';
  
  if (message.includes('requires user role') && message.includes('turfadmin')) {
    return 'You are trying to access user endpoints with turfadmin role. Please use turfadmin-specific endpoints or contact support.';
  }
  
  if (message.includes('requires turfadmin role')) {
    return 'You need turf admin permissions to access this feature.';
  }
  
  if (message.includes('requires user role')) {
    return 'This feature is only available for regular users. Please use your user account.';
  }
  
  if (message.includes('requires admin role')) {
    return 'You need admin permissions to access this feature.';
  }
  
  return 'Access denied. Please check your permissions or contact support.';
}

/**
 * Redirect user based on role to appropriate endpoints
 * @param {string} userRole - Current user role
 * @param {Function} navigate - Navigation function
 * @param {string} intendedPath - The path user was trying to access (optional)
 */
export function handleRoleRedirect(userRole, navigate, intendedPath = null) {
  if (!userRole) {
    navigate('/login');
    return;
  }
  
  const userRoleLower = userRole.toLowerCase();
  
  // If user was trying to access a specific path, redirect based on role
  if (intendedPath) {
    if (intendedPath.includes('/user/') && userRoleLower === 'turfadmin') {
      // Convert user path to turfadmin path
      const turfadminPath = intendedPath.replace('/user/', '/turfadmin/');
      navigate(turfadminPath);
      return;
    }
    
    if (intendedPath.includes('/turfadmin/') && userRoleLower === 'user') {
      // Convert turfadmin path to user path
      const userPath = intendedPath.replace('/turfadmin/', '/user/');
      navigate(userPath);
      return;
    }
  }
  
  // Default redirects based on role
  switch (userRoleLower) {
    case 'user':
      navigate('/user/dashboard');
      break;
    case 'turfadmin':
      navigate('/turfadmin/dashboard');
      break;
    case 'admin':
      navigate('/admin/dashboard');
      break;
    default:
      navigate('/');
  }
}

/**
 * Get appropriate endpoint path based on user role
 * @param {string} userRole - Current user role
 * @param {string} basePath - Base path without role prefix
 * @returns {string} Role-specific endpoint path
 */
export function getRoleBasedPath(userRole, basePath) {
  if (!userRole || !basePath) return basePath;
  
  const userRoleLower = userRole.toLowerCase();
  
  // Remove leading slash if present
  const cleanPath = basePath.startsWith('/') ? basePath.substring(1) : basePath;
  
  switch (userRoleLower) {
    case 'user':
      return `/user/${cleanPath}`;
    case 'turfadmin':
      return `/turfadmin/${cleanPath}`;
    case 'admin':
      return `/admin/${cleanPath}`;
    default:
      return `/${cleanPath}`;
  }
}

/**
 * Get user-friendly explanation of the access denied error
 * @param {string} userRole - Current user's role
 * @param {string} requiredRole - Required role
 * @returns {Object} Explanation object with title and message
 */
export function explainAccessDenied(userRole, requiredRole) {
  const explanations = {
    'turfadmin_needs_user': {
      title: 'Wrong Endpoint Access',
      message: `You have "turfadmin" role but are trying to access "user" endpoints.

Solution:
- Use turfadmin-specific endpoints instead
- Example: /turfadmin/dashboard instead of /user/dashboard
- Contact support if you need access to user features

Current role: ${userRole}
Required role: ${requiredRole}

This is normal - each role has its own endpoints.`
    },
    'user_needs_turfadmin': {
      title: 'Insufficient Permissions',
      message: `You have "user" role but are trying to access "turfadmin" endpoints.

Current role: ${userRole}
Required role: ${requiredRole}

Please contact an administrator to upgrade your account to turfadmin.`
    },
    'user_needs_admin': {
      title: 'Insufficient Permissions',
      message: `You have "user" role, but this feature requires admin access.

Current role: ${userRole}
Required role: ${requiredRole}

Please contact an administrator for access.`
    },
    'generic': {
      title: 'Access Denied',
      message: `Role mismatch detected.

Your role: ${userRole}
Required role: ${requiredRole}

Please contact support for assistance.`
    }
  };

  const key = `${userRole?.toLowerCase()}_needs_${requiredRole?.toLowerCase()}`;
  return explanations[key] || explanations.generic;
}

/**
 * Validate token and check if user has required role
 * @param {string} token - JWT token
 * @param {string} requiredRole - Required role to access resource
 * @returns {object} - Validation result with success status and data
 */
export function validateTokenAndRole(token, requiredRole) {
  if (!token) {
    return {
      success: false,
      error: 'No authentication token provided',
      code: 'NO_TOKEN'
    };
  }

  try {
    // Extract role from token
    const userRole = extractRoleFromToken(token);
    
    if (!userRole) {
      return {
        success: false,
        error: 'Invalid token or no role found',
        code: 'INVALID_TOKEN'
      };
    }

    // Check if user has required role
    const hasAccess = hasRequiredRoleEnhanced(userRole, requiredRole);
    
    if (!hasAccess) {
      return {
        success: false,
        error: `Access denied. Required role: ${requiredRole}, Current role: ${userRole}`,
        code: 'INSUFFICIENT_ROLE',
        userRole,
        requiredRole
      };
    }

    return {
      success: true,
      userRole,
      message: 'Access granted'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Token validation failed',
      code: 'TOKEN_ERROR',
      details: error.message
    };
  }
}

/**
 * Show role-based error message to user
 * @param {string} userRole - Current user role
 * @param {string} requiredRole - Required role
 * @param {function} showToast - Toast notification function (optional)
 * @returns {string} - Error message
 */
export function showRoleErrorMessage(userRole, requiredRole, showToast = null) {
  const explanation = explainAccessDenied(userRole, requiredRole);
  const message = `${explanation.title}: ${explanation.message}`;
  
  // Show toast notification if function provided
  if (showToast && typeof showToast === 'function') {
    showToast(explanation.title, {
      description: explanation.message,
      variant: 'destructive',
      duration: 5000
    });
  }
  
  // Also log to console for debugging
  console.warn('Role Access Denied:', {
    userRole,
    requiredRole,
    explanation
  });
  
  return message;
}

// Export all functions as a default object to ensure they're available
export default {
  calculateDistance,
  getAvailableSlotsCount,
  hasAvailableSlots,
  formatPrice,
  calculateCartTotal,
  openGoogleMapsDirections,
  shareTurf,
  getDirections,
  toggleFavorite,
  filterTurfs,
  extractRoleFromToken,
  hasRequiredRole,
  handleAccessDenied,
  handleRoleRedirect,
  validateTokenAndRole,
  showRoleErrorMessage,
  hasHierarchicalAccess,
  hasRequiredRoleEnhanced,
  explainAccessDenied,
  getRoleBasedPath
};
