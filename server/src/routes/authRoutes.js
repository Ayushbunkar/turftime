import express from "express";
import { registerUser, loginUser, getCurrentUser } from "../controllers/authController.js";
import { 
  forgotPassword, 
  resetPassword, 
  changePassword, 
  verifyResetToken 
} from "../controllers/passwordResetController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/signup", registerUser);
router.post("/login", loginUser);

// Password reset routes (public)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-reset-token/:token/:type", verifyResetToken);

// Protected routes
router.get("/me", authenticate, getCurrentUser);
router.patch("/change-password", authenticate, changePassword);

export default router;
