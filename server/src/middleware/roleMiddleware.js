// Role hierarchy definition
const roleHierarchy = {
  'superAdmin': ['superAdmin', 'admin', 'turfAdmin', 'user'], // SuperAdmin can access all endpoints
  'admin': ['admin', 'turfAdmin', 'user'], // Admin can access admin, turfAdmin and user endpoints
  'turfAdmin': ['turfAdmin', 'user'], // TurfAdmin can access turfAdmin and user endpoints  
  'user': ['user'] // User can only access user endpoints
};

// Check if user role has access to required role based on hierarchy
function hasRoleAccess(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  
  const userRoleLower = userRole.toLowerCase();
  const requiredRoleLower = requiredRole.toLowerCase();
  
  return roleHierarchy[userRoleLower]?.includes(requiredRoleLower) || false;
}

// Middleware to check role for protected routes (with hierarchy support)
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasRoleAccess(req.user.role, role)) {
      return res.status(403).json({ 
        error: `Access denied. User has ${req.user.role} role but requires ${role} role.`,
        userRole: req.user.role,
        requiredRole: role
      });
    }
    
    next();
  };
}

// Middleware to check multiple allowed roles (with hierarchy support)
export function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const hasAccess = roles.some(role => hasRoleAccess(req.user.role, role));
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: `Access denied. User has ${req.user.role} role but requires one of: ${roles.join(', ')}.`,
        userRole: req.user.role,
        requiredRoles: roles
      });
    }
    
    next();
  };
}
