import TimeSlot from '../models/TimeSlot.js';
import Turf from '../models/Turf.js';
import Booking from '../models/Booking.js';
import BookingAnalytics from '../models/BookingAnalytics.js';
import { sendCombinedNotification, scheduleBookingReminder } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Get available slots for a turf and date
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { turfId } = req.params;
  const { date } = req.query;

  if (!date) {
    throw new ApiError(400, 'Date is required');
  }

  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new ApiError(404, 'Turf not found');
  }

  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    throw new ApiError(400, 'Invalid date format');
  }

  // Check if slots exist for this date, if not create them
  let slots = await TimeSlot.find({ 
    turf: turfId, 
    date: targetDate 
  }).sort({ slotNumber: 1 });

  if (slots.length === 0) {
    // Generate slots for this date using turf's base price
    slots = await TimeSlot.generateDailySlots(turfId, targetDate, turf.pricePerHour);
  }

  res.status(200).json(
    new ApiResponse(200, slots, 'Slots fetched successfully')
  );
});

// Get slots for multiple dates (for calendar view)
export const getSlotsByDateRange = asyncHandler(async (req, res) => {
  const { turfId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, 'Start date and end date are required');
  }

  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new ApiError(404, 'Turf not found');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError(400, 'Invalid date format');
  }

  // Ensure we don't generate too many slots at once (max 30 days)
  const daysDifference = (end - start) / (1000 * 60 * 60 * 24);
  if (daysDifference > 30) {
    throw new ApiError(400, 'Date range cannot exceed 30 days');
  }

  const slots = await TimeSlot.find({
    turf: turfId,
    date: { $gte: start, $lte: end }
  }).sort({ date: 1, slotNumber: 1 });

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const dateKey = slot.date.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {});

  res.status(200).json(
    new ApiResponse(200, slotsByDate, 'Slots fetched successfully')
  );
});

// Book multiple consecutive slots
export const bookSlots = asyncHandler(async (req, res) => {
  const { 
    turfId, 
    slotIds, 
    contactName, 
    contactPhone, 
    contactEmail, 
    teamSize, 
    specialRequests 
  } = req.body;

  if (!turfId || !slotIds || slotIds.length === 0) {
    throw new ApiError(400, 'Turf ID and slot IDs are required');
  }

  if (!contactName || !contactPhone || !contactEmail) {
    throw new ApiError(400, 'Contact information is required');
  }

  // Verify turf exists
  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new ApiError(404, 'Turf not found');
  }

  // Get all requested slots
  const slots = await TimeSlot.find({
    _id: { $in: slotIds },
    turf: turfId
  }).sort({ slotNumber: 1 });

  if (slots.length !== slotIds.length) {
    throw new ApiError(400, 'Some slots not found or belong to different turf');
  }

  // Check if all slots are available
  const unavailableSlots = slots.filter(slot => !slot.canBook());
  if (unavailableSlots.length > 0) {
    throw new ApiError(400, 'Some slots are not available for booking');
  }

  // Check if slots are consecutive
  const sortedSlots = slots.sort((a, b) => a.slotNumber - b.slotNumber);
  for (let i = 1; i < sortedSlots.length; i++) {
    if (sortedSlots[i].slotNumber !== sortedSlots[i - 1].slotNumber + 1) {
      throw new ApiError(400, 'Slots must be consecutive');
    }
  }

  // Calculate total price and booking details
  const totalPrice = slots.reduce((sum, slot) => sum + slot.price, 0);
  const bookingDate = slots[0].date;
  const startTime = slots[0].startTime;
  const endTime = slots[slots.length - 1].endTime;
  const duration = slots.length;

  // Create booking
  const booking = new Booking({
    user: req.user._id,
    turf: turfId,
    timeSlots: slotIds,
    bookingDate,
    startTime,
    endTime,
    duration,
    totalPrice,
    price: totalPrice, // For backward compatibility
    contactName,
    contactPhone,
    contactEmail,
    teamSize,
    specialRequests,
    status: 'pending'
  });

  // Start transaction to ensure atomicity
  const session = await TimeSlot.startSession();
  session.startTransaction();

  try {
    // Update slot statuses
    await TimeSlot.updateMany(
      { _id: { $in: slotIds } },
      { 
        status: 'booked',
        $inc: { currentBookings: 1 }
      },
      { session }
    );

    // Save booking
    await booking.save({ session });

    await session.commitTransaction();

    // Populate booking details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('turf', 'name location')
      .populate('timeSlots');

    // Send booking confirmation notification
    try {
      const notificationData = {
        customerName: booking.contactName,
        bookingRef: booking.bookingRef || `TRF-${booking._id.toString().slice(-6).toUpperCase()}`,
        turfName: turf.name,
        turfLocation: turf.location,
        bookingDate: booking.bookingDate,
        timeSlots: `${booking.startTime} - ${booking.endTime}`,
        duration: booking.duration,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
        contactEmail: booking.contactEmail,
        contactPhone: booking.contactPhone,
        specialRequests: booking.specialRequests
      };

      // Send immediate confirmation
      await sendCombinedNotification('booking_confirmation', notificationData);
      
      // Schedule reminder notification
      scheduleBookingReminder(populatedBooking);
      
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't fail the booking if notification fails
    }

    res.status(201).json(
      new ApiResponse(201, populatedBooking, 'Booking created successfully')
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Cancel booking
export const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findById(bookingId).populate('timeSlots');
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Check if user owns the booking or is admin
  if (booking.user.toString() !== req.user._id.toString() && 
      !['admin', 'superAdmin', 'turfAdmin'].includes(req.user.role)) {
    throw new ApiError(403, 'Not authorized to cancel this booking');
  }

  if (!booking.canCancel()) {
    throw new ApiError(400, 'Booking cannot be cancelled');
  }

  const refundAmount = booking.calculateRefund();

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user._id;
    booking.cancellationDate = new Date();
    booking.refundAmount = refundAmount;
    await booking.save({ session });

    // Update slot statuses back to available
    await TimeSlot.updateMany(
      { _id: { $in: booking.timeSlots.map(slot => slot._id) } },
      { 
        status: 'available',
        $inc: { currentBookings: -1 }
      },
      { session }
    );

    await session.commitTransaction();

    // Send cancellation notification
    try {
      const turf = await Turf.findById(booking.turf);
      const notificationData = {
        customerName: booking.contactName,
        bookingRef: booking.bookingRef || `TRF-${booking._id.toString().slice(-6).toUpperCase()}`,
        turfName: turf?.name || 'Turf',
        bookingDate: booking.bookingDate,
        timeSlots: `${booking.startTime} - ${booking.endTime}`,
        cancellationDate: booking.cancellationDate,
        cancellationReason: booking.cancellationReason,
        refundAmount,
        contactEmail: booking.contactEmail,
        contactPhone: booking.contactPhone
      };

      await sendCombinedNotification('booking_cancelled', notificationData);
    } catch (notificationError) {
      console.error('Error sending cancellation notifications:', notificationError);
    }

    res.status(200).json(
      new ApiResponse(200, { booking, refundAmount }, 'Booking cancelled successfully')
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Get user bookings
export const getUserBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const filter = { user: req.user._id };
  if (status) {
    filter.status = status;
  }

  const bookings = await Booking.find(filter)
    .populate('turf', 'name location images')
    .populate('timeSlots')
    .sort({ bookingDate: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Booking.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, {
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, 'Bookings fetched successfully')
  );
});

// Admin: Get all bookings for a turf
export const getTurfBookings = asyncHandler(async (req, res) => {
  const { turfId } = req.params;
  const { page = 1, limit = 10, date, status } = req.query;

  // Check if user is authorized (turf owner or admin)
  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new ApiError(404, 'Turf not found');
  }

  if (turf.owner.toString() !== req.user._id.toString() && 
      !['admin', 'superAdmin'].includes(req.user.role)) {
    throw new ApiError(403, 'Not authorized to view these bookings');
  }

  const filter = { turf: turfId };
  if (date) {
    filter.bookingDate = new Date(date);
  }
  if (status) {
    filter.status = status;
  }

  const bookings = await Booking.find(filter)
    .populate('user', 'name email phone')
    .populate('timeSlots')
    .sort({ bookingDate: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Booking.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, {
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, 'Turf bookings fetched successfully')
  );
});

export default {
  getAvailableSlots,
  getSlotsByDateRange,
  bookSlots,
  cancelBooking,
  getUserBookings,
  getTurfBookings
};