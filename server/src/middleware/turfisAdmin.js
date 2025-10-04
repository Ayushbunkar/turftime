// Role hierarchy for admin access
const adminRoles = ['admin']; // Only admin can access admin endpoints

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  
  if (adminRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ 
      message: 'Access denied. Admins only.',
      userRole: req.user.role,
      requiredRole: 'admin'
    });
  }
};
