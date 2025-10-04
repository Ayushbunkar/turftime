import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createManualNotification,
  getNotificationStats
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ==================== USER NOTIFICATION ROUTES ====================

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications with filtering and pagination
 * @access  Private (User/Admin)
 * @params  Query: page, limit, type, read, priority
 */
router.get('/', authenticate, getUserNotifications);

/**
 * @route   PATCH /api/notifications/:notificationId/read
 * @desc    Mark specific notification as read
 * @access  Private (User/Admin)
 * @params  notificationId (URL parameter)
 */
router.patch('/:notificationId/read', authenticate, markNotificationAsRead);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read for authenticated user
 * @access  Private (User/Admin)
 */
router.patch('/read-all', authenticate, markAllNotificationsAsRead);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete specific notification
 * @access  Private (User/Admin)
 * @params  notificationId (URL parameter)
 */
router.delete('/:notificationId', authenticate, deleteNotification);

// ==================== ADMIN NOTIFICATION ROUTES ====================

/**
 * @route   POST /api/notifications/send
 * @desc    Send manual notification to users (Admin/Super Admin only)
 * @access  Private (Admin/Super Admin)
 * @body    {
 *            recipientIds: string | string[],
 *            type: string,
 *            data: object,
 *            options?: {
 *              email?: boolean,
 *              sms?: boolean,
 *              push?: boolean,
 *              inApp?: boolean,
 *              priority?: 'low' | 'medium' | 'high',
 *              scheduledFor?: Date,
 *              expiresAt?: Date
 *            }
 *          }
 */
router.post(
  '/send',
  authenticate,
  authorizeRoles('admin', 'super_admin'),
  createManualNotification
);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics and analytics
 * @access  Private (Admin/Super Admin)
 * @params  Query: period (7d, 30d, 90d)
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('admin', 'super_admin'),
  getNotificationStats
);

export default router;