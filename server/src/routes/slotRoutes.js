import express from 'express';
import { 
  getAvailableSlots, 
  getSlotsByDateRange, 
  bookSlots, 
  cancelBooking, 
  getUserBookings, 
  getTurfBookings 
} from '../controllers/slotController.js';
import {
  updateSlotAvailability,
  bulkCreateSlots,
  getTurfAnalytics,
  generateAnalytics,
  updateSlotPricing,
  getDailyReport
} from '../controllers/adminSlotController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAnyRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/turf/:turfId/available', getAvailableSlots);
router.get('/turf/:turfId/date-range', getSlotsByDateRange);

// Protected user routes
router.use(authenticate);

// User booking routes
router.post('/book', bookSlots);
router.patch('/cancel/:bookingId', cancelBooking);
router.get('/my-bookings', getUserBookings);

// Admin routes - require authentication and proper role
router.get('/turf/:turfId/bookings', getTurfBookings);
router.get('/turf/:turfId/analytics', getTurfAnalytics);
router.get('/turf/:turfId/report', getDailyReport);

// Admin management routes
router.patch('/availability', requireAnyRole(['admin', 'turfAdmin']), updateSlotAvailability);
router.post('/bulk-create', requireAnyRole(['admin', 'turfAdmin']), bulkCreateSlots);
router.post('/turf/:turfId/generate-analytics', requireAnyRole(['admin', 'turfAdmin']), generateAnalytics);
router.patch('/pricing', requireAnyRole(['admin', 'turfAdmin']), updateSlotPricing);

export default router;