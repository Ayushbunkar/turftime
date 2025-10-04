import express from "express";
import * as turfadminController from "../controllers/turfadminController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import multer from "multer";
import path from "path";

// Keep local storage as fallback
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`),
});
const localUpload = multer({ storage: localStorage });

// Always use the uploadToCloudinary middleware (it handles both Cloudinary and local storage)
const upload = uploadToCloudinary;

const router = express.Router();

// Auth
router.post("/register", turfadminController.registerAdmin);
router.post("/login", turfadminController.loginAdmin);

// Test route (no auth required)
router.get("/test", (req, res) => {
  console.log('🧪 Turfadmin test route called');
  res.json({
    status: 'success',
    message: 'Turfadmin routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Protected routes
router.use(protect);
router.use(restrictTo("turfadmin"));

// Admin account
router.patch("/change-password", turfadminController.changeAdminPassword);

// Dashboard
router.get("/dashboard", turfadminController.getDashboardData);
router.get("/stats", turfadminController.getStats);

// Turf - with enhanced error handling
router.get("/turfs", (req, res, next) => {
  console.log('🏟️ GET /turfs route called');
  console.log('👤 User:', req.user?.id);
  turfadminController.getMyTurfs(req, res, next);
});

router.post("/turfs", (req, res, next) => {
  console.log('🏟️ POST /turfs route called');
  console.log('👤 User:', req.user?.id);
  console.log('📝 Body keys:', Object.keys(req.body));
  console.log('📁 Files count:', req.files?.length || 0);
  
  // Apply upload middleware and then controller
  upload.array("images", 5)(req, res, (uploadErr) => {
    if (uploadErr) {
      console.error('❌ Upload middleware error:', uploadErr);
      return next(uploadErr);
    }
    
    console.log('✅ Upload middleware completed');
    console.log('📁 Processed files:', req.files?.length || 0);
    
    turfadminController.createTurf(req, res, next);
  });
});

router.put("/turfs/:id", (req, res, next) => {
  console.log('🏟️ PUT /turfs/:id route called');
  console.log('👤 User:', req.user?.id);
  console.log('📁 Expected files:', req.headers['content-type']?.includes('multipart'));
  
  // Apply upload middleware with error handling
  upload.array("images", 10)(req, res, (uploadErr) => {
    if (uploadErr) {
      console.error('❌ Upload middleware error:', uploadErr);
      
      // Handle specific multer errors
      if (uploadErr.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          status: 'error',
          message: 'One or more files are too large. Maximum file size is 25MB per image.'
        });
      } else if (uploadErr.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          status: 'error',
          message: 'Too many files. Maximum 10 images allowed.'
        });
      } else if (uploadErr.message && uploadErr.message.includes('File')) {
        return res.status(400).json({
          status: 'error',
          message: uploadErr.message
        });
      } else {
        return res.status(500).json({
          status: 'error',
          message: 'File upload failed. Please try again.'
        });
      }
    }
    
    console.log('✅ Upload middleware completed for update');
    console.log('📁 Processed files:', req.files?.length || 0);
    
    turfadminController.updateTurf(req, res, next);
  });
});
router.delete("/turfs/:id", turfadminController.deleteTurf);

// Bookings
router.get("/bookings", turfadminController.getMyBookings);
router.get("/bookings/recent", turfadminController.getRecentBookings);
router.get("/bookings/export", turfadminController.exportBookings);
router.patch("/bookings/:id", turfadminController.updateBookingStatus);

// Analytics
router.get("/analytics", turfadminController.getAnalytics);

// Profile
router.patch("/profile", turfadminController.updateProfile);

// Settings
router.get("/settings", turfadminController.getSettings);
router.patch("/settings", turfadminController.updateSettings);

// Notifications
router.get("/notifications", turfadminController.getNotifications);
router.patch("/notifications/:id/read", turfadminController.markNotificationAsRead);
router.patch("/notifications/mark-all-read", turfadminController.markAllNotificationsAsRead);
router.delete("/notifications/:id", turfadminController.deleteNotification);

// Data Management
router.get("/export-data", turfadminController.exportData);
router.delete("/account", turfadminController.deleteAccount);

// Support & Help
router.get("/support/tickets", turfadminController.getSupportTickets);
router.post("/support/tickets", turfadminController.createSupportTicket);
router.get("/support/tickets/:id", turfadminController.getSupportTicketById);
router.patch("/support/tickets/:id", turfadminController.updateSupportTicket);

export default router;
