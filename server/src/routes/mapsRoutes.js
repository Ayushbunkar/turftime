import express from 'express';
import { getDistance } from '../controllers/mapsController.js';

const router = express.Router();

// Route to get distance between two locations
router.post('/distance', getDistance);

export default router;