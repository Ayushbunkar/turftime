import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import User from '../models/userModel.js';
import Turf from '../models/Turf.js';
import catchAsync from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import { sendEmail } from '../utils/sendEmailNew.js';

// Initialize payment gateways
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==================== STRIPE INTEGRATION ====================

/**
 * Create Stripe checkout session
 */
export const createStripeCheckout = catchAsync(async (req, res) => {
  const { bookingId, successUrl, cancelUrl } = req.body;

  // Get booking details
  const booking = await Booking.findById(bookingId)
    .populate('user', 'name email')
    .populate('turf', 'name location');

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  if (booking.paymentStatus === 'completed') {
    return res.status(400).json({
      status: 'error',
      message: 'Booking is already paid'
    });
  }

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Turf Booking - ${booking.turf.name}`,
              description: `Booking for ${booking.bookingDate.toDateString()} at ${booking.startTime} - ${booking.endTime}`,
            },
            unit_amount: booking.totalPrice * 100, // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${req.protocol}://${req.get('host')}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.protocol}://${req.get('host')}/booking-cancelled`,
      metadata: {
        bookingId: bookingId,
        userId: booking.user._id.toString(),
        turfId: booking.turf._id.toString(),
      },
    });

    // Update booking with Stripe session ID
    await Booking.findByIdAndUpdate(bookingId, {
      paymentGateway: 'stripe',
      paymentId: session.id,
      paymentStatus: 'pending'
    });

    res.status(200).json({
      status: 'success',
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create payment session'
    });
  }
});

/**
 * Handle Stripe webhook
 */
export const stripeWebhook = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleStripePaymentSuccess(session);
      break;
    case 'checkout.session.expired':
      const expiredSession = event.data.object;
      await handleStripePaymentExpired(expiredSession);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * Handle successful Stripe payment
 */
const handleStripePaymentSuccess = async (session) => {
  try {
    const bookingId = session.metadata.bookingId;
    
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'completed',
        status: 'confirmed',
        paymentCompletedAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email').populate('turf', 'name');

    if (booking) {
      // Send confirmation email
      await sendEmail({
        email: booking.user.email,
        subject: 'Booking Confirmed - TurfHub',
        message: `
          <h2>Booking Confirmed!</h2>
          <p>Hi ${booking.user.name},</p>
          <p>Your booking has been confirmed and payment has been processed successfully.</p>
          
          <h3>Booking Details:</h3>
          <ul>
            <li><strong>Turf:</strong> ${booking.turf.name}</li>
            <li><strong>Date:</strong> ${booking.bookingDate.toDateString()}</li>
            <li><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</li>
            <li><strong>Amount Paid:</strong> ₹${booking.totalPrice}</li>
            <li><strong>Booking ID:</strong> ${booking._id}</li>
          </ul>
          
          <p>Please arrive 10 minutes before your booking time.</p>
          <br>
          <p>Best regards,<br>TurfHub Team</p>
        `
      });

      console.log(`✅ Stripe payment successful for booking ${bookingId}`);
    }
  } catch (error) {
    console.error('Error handling Stripe payment success:', error);
  }
};

/**
 * Handle expired Stripe payment
 */
const handleStripePaymentExpired = async (session) => {
  try {
    const bookingId = session.metadata.bookingId;
    
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'failed',
      status: 'cancelled'
    });

    console.log(`❌ Stripe payment expired for booking ${bookingId}`);
  } catch (error) {
    console.error('Error handling Stripe payment expiry:', error);
  }
};

// ==================== RAZORPAY INTEGRATION ====================

/**
 * Create Razorpay order
 */
export const createRazorpayOrder = catchAsync(async (req, res) => {
  const { bookingId } = req.body;

  // Get booking details
  const booking = await Booking.findById(bookingId)
    .populate('user', 'name email')
    .populate('turf', 'name location');

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  if (booking.paymentStatus === 'completed') {
    return res.status(400).json({
      status: 'error',
      message: 'Booking is already paid'
    });
  }

  try {
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: booking.totalPrice * 100, // Convert to paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId: bookingId,
        userId: booking.user._id.toString(),
        turfId: booking.turf._id.toString(),
      }
    });

    // Update booking with Razorpay order ID
    await Booking.findByIdAndUpdate(bookingId, {
      paymentGateway: 'razorpay',
      paymentId: order.id,
      paymentStatus: 'pending'
    });

    res.status(200).json({
      status: 'success',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create payment order'
    });
  }
});

/**
 * Verify Razorpay payment
 */
export const verifyRazorpayPayment = catchAsync(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payment signature'
    });
  }

  try {
    // Update booking status
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'completed',
        status: 'confirmed',
        paymentId: razorpay_payment_id,
        paymentCompletedAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email').populate('turf', 'name');

    if (booking) {
      // Send confirmation email
      await sendEmail({
        email: booking.user.email,
        subject: 'Booking Confirmed - TurfHub',
        message: `
          <h2>Booking Confirmed!</h2>
          <p>Hi ${booking.user.name},</p>
          <p>Your booking has been confirmed and payment has been processed successfully.</p>
          
          <h3>Booking Details:</h3>
          <ul>
            <li><strong>Turf:</strong> ${booking.turf.name}</li>
            <li><strong>Date:</strong> ${booking.bookingDate.toDateString()}</li>
            <li><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</li>
            <li><strong>Amount Paid:</strong> ₹${booking.totalPrice}</li>
            <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
            <li><strong>Booking ID:</strong> ${booking._id}</li>
          </ul>
          
          <p>Please arrive 10 minutes before your booking time.</p>
          <br>
          <p>Best regards,<br>TurfHub Team</p>
        `
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment verified and booking confirmed',
      data: booking
    });
  } catch (error) {
    console.error('Razorpay payment verification error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to verify payment'
    });
  }
});

// ==================== GENERAL PAYMENT FUNCTIONS ====================

/**
 * Get payment status for a booking
 */
export const getPaymentStatus = catchAsync(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .select('paymentStatus paymentGateway paymentId totalPrice paymentCompletedAt')
    .populate('user', 'name email')
    .populate('turf', 'name');

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: booking
  });
});

/**
 * Process refund
 */
export const processRefund = catchAsync(async (req, res) => {
  const { bookingId, amount, reason } = req.body;

  const booking = await Booking.findById(bookingId)
    .populate('user', 'name email')
    .populate('turf', 'name');

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  if (booking.paymentStatus !== 'completed') {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot refund uncompleted payment'
    });
  }

  try {
    let refundId;

    // Process refund based on payment gateway
    if (booking.paymentGateway === 'stripe') {
      const refund = await stripe.refunds.create({
        payment_intent: booking.paymentId,
        amount: amount ? amount * 100 : undefined, // Convert to paise or full refund
      });
      refundId = refund.id;
    } else if (booking.paymentGateway === 'razorpay') {
      const refund = await razorpay.payments.refund(booking.paymentId, {
        amount: amount ? amount * 100 : booking.totalPrice * 100, // Convert to paise
        notes: {
          reason: reason || 'Customer requested refund'
        }
      });
      refundId = refund.id;
    }

    // Update booking with refund information
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'refunded',
      status: 'cancelled',
      refundAmount: amount || booking.totalPrice,
      refundId: refundId,
      refundReason: reason,
      refundProcessedAt: new Date()
    });

    // Send refund confirmation email
    await sendEmail({
      email: booking.user.email,
      subject: 'Refund Processed - TurfHub',
      message: `
        <h2>Refund Processed</h2>
        <p>Hi ${booking.user.name},</p>
        <p>Your refund has been processed successfully.</p>
        
        <h3>Refund Details:</h3>
        <ul>
          <li><strong>Booking:</strong> ${booking.turf.name}</li>
          <li><strong>Original Amount:</strong> ₹${booking.totalPrice}</li>
          <li><strong>Refund Amount:</strong> ₹${amount || booking.totalPrice}</li>
          <li><strong>Refund ID:</strong> ${refundId}</li>
          <li><strong>Reason:</strong> ${reason || 'Booking cancellation'}</li>
        </ul>
        
        <p>The refund will appear in your account within 5-7 business days.</p>
        <br>
        <p>Best regards,<br>TurfHub Team</p>
      `
    });

    res.status(200).json({
      status: 'success',
      message: 'Refund processed successfully',
      data: {
        refundId,
        amount: amount || booking.totalPrice
      }
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process refund'
    });
  }
});

/**
 * Get transaction history
 */
export const getTransactionHistory = catchAsync(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status = 'all',
    gateway = 'all',
    startDate,
    endDate
  } = req.query;

  // Build filter
  const filter = {};
  if (status !== 'all') {
    filter.paymentStatus = status;
  }
  if (gateway !== 'all') {
    filter.paymentGateway = gateway;
  }
  if (startDate && endDate) {
    filter.paymentCompletedAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // For turf admin, filter by their turfs
  if (req.user.role === 'turfadmin') {
    const turfIds = await Turf.find({ owner: req.user.id }).distinct('_id');
    filter.turf = { $in: turfIds };
  }

  const transactions = await Booking.find(filter)
    .populate('user', 'name email')
    .populate('turf', 'name')
    .select('paymentStatus paymentGateway paymentId totalPrice paymentCompletedAt refundAmount createdAt')
    .sort({ paymentCompletedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Booking.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTransactions: total
      }
    }
  });
});

/**
 * Get payout summary for turf admins
 */
export const getPayoutSummary = catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }

  // Get turf admin's turfs
  const turfIds = await Turf.find({ owner: req.user.id }).distinct('_id');

  // Calculate payout summary
  const summary = await Booking.aggregate([
    {
      $match: {
        turf: { $in: turfIds },
        paymentStatus: 'completed',
        paymentCompletedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        totalBookings: { $sum: 1 },
        platformCommission: { $sum: { $multiply: ['$totalPrice', 0.1] } }, // 10% commission
      }
    }
  ]);

  const data = summary[0] || { totalRevenue: 0, totalBookings: 0, platformCommission: 0 };
  data.payoutAmount = data.totalRevenue - data.platformCommission;

  res.status(200).json({
    status: 'success',
    data: {
      period,
      summary: data
    }
  });
});