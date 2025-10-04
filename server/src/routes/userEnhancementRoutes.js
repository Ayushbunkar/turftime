import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  deleteUserAccount,
  getUserBookingHistory,
  getUserFavorites,
  toggleFavorite,
  getUserAnalytics,
  getUserRecommendations
} from '../controllers/userEnhancementController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== USER PROFILE ROUTES ====================

/**
 * @route   GET /api/users/profile
 * @desc    Get enhanced user profile with statistics
 * @access  Private (User)
 */
router.get('/profile', authenticate, getUserProfile);

/**
 * @route   PATCH /api/users/profile
 * @desc    Update user profile information
 * @access  Private (User)
 * @body    {
 *            firstName?: string,
 *            lastName?: string,
 *            phoneNumber?: string,
 *            dateOfBirth?: Date,
 *            profilePicture?: string,
 *            preferences?: object,
 *            address?: object
 *          }
 */
router.patch('/profile', authenticate, updateUserProfile);

/**
 * @route   PATCH /api/users/preferences
 * @desc    Update user notification and privacy preferences
 * @access  Private (User)
 * @body    {
 *            notifications?: {
 *              email?: boolean,
 *              sms?: boolean,
 *              push?: boolean,
 *              booking?: boolean,
 *              promotional?: boolean
 *            },
 *            privacy?: {
 *              shareProfile?: boolean,
 *              showBookings?: boolean,
 *              shareLocation?: boolean
 *            },
 *            booking?: {
 *              autoConfirm?: boolean,
 *              defaultDuration?: number,
 *              reminders?: boolean,
 *              favoriteLocations?: string[]
 *            }
 *          }
 */
router.patch('/preferences', authenticate, updateUserPreferences);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account (soft delete)
 * @access  Private (User)
 * @body    {
 *            password: string,
 *            confirmDelete: string // Must be "DELETE MY ACCOUNT"
 *          }
 */
router.delete('/account', authenticate, deleteUserAccount);

// ==================== USER BOOKING HISTORY ROUTES ====================

/**
 * @route   GET /api/users/booking-history
 * @desc    Get user booking history with advanced filtering
 * @access  Private (User)
 * @params  Query: page, limit, status, dateFrom, dateTo, turfType, location, sortBy, sortOrder
 */
router.get('/booking-history', authenticate, getUserBookingHistory);

// ==================== USER FAVORITES ROUTES ====================

/**
 * @route   GET /api/users/favorites
 * @desc    Get user favorite turfs with booking statistics
 * @access  Private (User)
 */
router.get('/favorites', authenticate, getUserFavorites);

/**
 * @route   POST /api/users/favorites/:turfId
 * @desc    Add/remove turf from favorites (toggle)
 * @access  Private (User)
 * @params  turfId (URL parameter)
 */
router.post('/favorites/:turfId', authenticate, toggleFavorite);

// ==================== USER ANALYTICS ROUTES ====================

/**
 * @route   GET /api/users/analytics
 * @desc    Get user activity analytics and insights
 * @access  Private (User)
 * @params  Query: period (1m, 3m, 6m, 1y)
 */
router.get('/analytics', authenticate, getUserAnalytics);

/**
 * @route   GET /api/users/recommendations
 * @desc    Get personalized turf recommendations
 * @access  Private (User)
 */
router.get('/recommendations', authenticate, getUserRecommendations);

export default router;