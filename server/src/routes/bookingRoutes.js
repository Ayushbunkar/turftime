import express from "express";
import {
  createBooking,
  getBookingsByEmail,
  cancelBooking,
  getUserBookings,
} from "../controllers/bookingController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all booking routes
router.use(protect);

// Booking management routes - accessible to both users and turfadmins
// Users: book turfs and manage their own bookings
// TurfAdmins: manage bookings for their turfs, customer service
router.get("/user", restrictTo("user", "turfadmin"), getUserBookings);
router.post("/", restrictTo("user", "turfadmin"), createBooking);
router.delete("/:id", restrictTo("user", "turfadmin"), cancelBooking);

// Email-based booking lookup (for customer service and management)
router.get("/", restrictTo("user", "turfadmin"), getBookingsByEmail);

export default router;
