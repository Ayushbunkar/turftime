import express from 'express';
import {
  createStripeCheckout,
  stripeWebhook,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
  processRefund,
  getTransactionHistory,
  getPayoutSummary
} from '../controllers/paymentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== STRIPE ROUTES ====================
router.post('/stripe/create-checkout', protect, createStripeCheckout);
router.post('/stripe/webhook', express.raw({type: 'application/json'}), stripeWebhook);

// ==================== RAZORPAY ROUTES ====================
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

// ==================== GENERAL PAYMENT ROUTES ====================
router.get('/status/:bookingId', protect, getPaymentStatus);
router.get('/transactions', protect, getTransactionHistory);

// ==================== ADMIN/SUPER ADMIN ROUTES ====================
router.post('/refund', protect, restrictTo('admin', 'superadmin', 'turfadmin'), processRefund);
router.get('/payout-summary', protect, restrictTo('turfadmin'), getPayoutSummary);

export default router;