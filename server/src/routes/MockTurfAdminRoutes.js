import express from "express";
import multer from "multer";
import * as mockTurfAdminController from "../controllers/mockTurfAdminController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes (auth)
router.post("/register", mockTurfAdminController.registerAdmin);
router.post("/login", mockTurfAdminController.loginAdmin);

// Protected routes - using mock data for now
// Temporarily bypass auth for testing
router.use((req, res, next) => {
  // Mock user for testing
  req.user = {
    id: 'mockadmin1',
    email: 'admin@test.com', 
    role: 'turfAdmin'
  };
  console.log('🔓 Mock auth bypassed for testing');
  next();
});
// router.use(protect);
// Temporarily comment out role restriction for testing
// router.use(restrictTo("turfAdmin"));

// Admin account
router.patch("/change-password", mockTurfAdminController.changeAdminPassword);

// Dashboard
router.get("/dashboard", mockTurfAdminController.getDashboardData);
router.get("/stats", mockTurfAdminController.getStats);

// Turf management
router.get("/turfs", mockTurfAdminController.getMyTurfs);
router.post("/turfs", upload.array("images", 5), mockTurfAdminController.createTurf);
router.put("/turfs/:id", upload.array("images", 5), mockTurfAdminController.updateTurf);
router.delete("/turfs/:id", mockTurfAdminController.deleteTurf);

// Bookings
router.get("/bookings", mockTurfAdminController.getMyBookings);
router.get("/bookings/recent", mockTurfAdminController.getRecentBookings);
router.get("/bookings/export", mockTurfAdminController.exportBookings);
router.patch("/bookings/:id", mockTurfAdminController.updateBookingStatus);

// Analytics
router.get("/analytics", mockTurfAdminController.getAnalytics);

// Notifications  
router.get("/notifications", mockTurfAdminController.getNotifications);

// Settings
router.get("/settings", mockTurfAdminController.getSettings);

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    status: "success",
    message: "Mock TurfAdmin API is working!",
    timestamp: new Date().toISOString(),
    user: req.user
  });
});

export default router;