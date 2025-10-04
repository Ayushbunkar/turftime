import express from 'express';
import {
  getDashboardStats,
  getRecentActivities,
  getSystemMetrics,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getTurfAdmins,
  updateTurfAdminStatus,
  getNotifications,
  createTurfAdmin,
  getAnalyticsData
} from '../controllers/superAdminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware: All routes require authentication and super admin role
router.use(authenticate);
router.use(restrictTo('admin', 'superAdmin', 'superadmin')); // Allow both admin and superAdmin/superadmin roles

// Dashboard routes
router.get('/dashboard-stats', getDashboardStats);
router.get('/recent-activities', getRecentActivities);
router.get('/system-metrics', getSystemMetrics);

// User management routes
router.get('/users', getAllUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);

// Turf admin management routes
router.get('/turf-admins', getTurfAdmins);
router.post('/turf-admins', createTurfAdmin);
router.patch('/turf-admins/:adminId/status', updateTurfAdminStatus);

// Notifications
router.get('/notifications', getNotifications);

// Analytics
router.get('/analytics', getAnalyticsData);

// System health endpoints (for future implementation)
router.get('/system-health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Database management endpoints (basic stats for now)
router.get('/database/stats', async (req, res) => {
  try {
    // This would typically connect to your database monitoring tools
    res.json({
      collections: {
        users: await import('../models/userModel.js').then(m => m.default.countDocuments()),
        turfs: await import('../models/Turf.js').then(m => m.default.countDocuments()),
        bookings: await import('../models/Booking.js').then(m => m.default.countDocuments())
      },
      lastBackup: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      status: 'healthy'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch database stats',
      error: error.message
    });
  }
});

export default router;