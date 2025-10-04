// src/routes/adminRoutes.js

import express from 'express';
import {
  registerAdmin,     // For registering turf admins (with secret key)
  loginAdmin,        // For both superadmin & turfadmin login
  // getAllUsers,       // View all users (admin-only)
   // View all bookings (admin-only)
  changeAdminPassword, // Change password for Turf Admin

  getAdminRecentActivities
} from '../controllers/turfadminController.js';


import { authenticate } from '../middleware/authenticate.js';
import { isAdmin } from '../middleware/turfisAdmin.js'; // Rename if needed

const router = express.Router();

// ✅ Register a Turf Admin (only possible with secret key in controller)
router.post('/register', registerAdmin);

// ✅ Login as Turf Admin or Super Admin
router.post('/login', loginAdmin);


// ✅ Change password for Turf Admin (requires authentication)
router.post('/change-password', authenticate, changeAdminPassword);

// ✅ Admin-only routes
// router.get('/users', authenticate, isAdmin, getAllUsers);
// router.get('/bookings', authenticate, isAdmin, getAllBookings);
// router.get('/stats', authenticate, isAdmin, getAdminStats);
router.get('/recent-activities', authenticate, isAdmin, getAdminRecentActivities);

export default router;
