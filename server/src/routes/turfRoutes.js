import express from "express";
import { getAllTurfs } from "../controllers/turfController.js";

const router = express.Router();

// Public endpoint - completely open, no authentication or role checking
router.get("/", getAllTurfs); // GET /api/turfs - accessible to EVERYONE (guests, users, admins)

export default router;
