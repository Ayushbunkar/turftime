import express from "express";
import { updateMe, changePassword } from "../controllers/userController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes and allow both user and turfadmin access
router.use(protect);
router.use(restrictTo("user", "turfadmin"));

router.patch("/me", updateMe);
router.patch("/change-password", changePassword);

export default router;

