import TimeSlot from '../models/TimeSlot.js';
import Turf from '../models/Turf.js';
import Booking from '../models/Booking.js';
import BookingAnalytics from '../models/BookingAnalytics.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Admin: Mark slots as unavailable/available
export const updateSlotAvailability = asyncHandler(async (req, res) => {
  const { slotIds, status, reason } = req.body;

  if (!slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
    throw new ApiError(400, 'Slot IDs are required');
  }

  if (!['available', 'unavailable', 'maintenance'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  // Get slots and verify ownership
  const slots = await TimeSlot.find({ _id: { $in: slotIds } }).populate('turf');
  
  if (slots.length === 0) {
    throw new ApiError(404, 'No slots found');
  }

  // Check authorization for each turf
  for (const slot of slots) {
    if (slot.turf.owner.toString() !== req.user._id.toString() && 
        !['admin', 'superadmin'].includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to modify slots for this turf');
    }
  }

  // Update slots
  const updateData = { 
    status,
    isBlocked: status !== 'available',
    blockedBy: status !== 'available' ? req.user._id : null,
    blockedReason: status !== 'available' ? reason : null
  };

  await TimeSlot.updateMany(
    { _id: { $in: slotIds } },
    updateData
  );

  const updatedSlots = await TimeSlot.find({ _id: { $in: slotIds } });

  res.status(200).json(
    new ApiResponse(200, updatedSlots, 'Slot availability updated successfully')
  );
});

// Admin: Bulk create slots for multiple days
export const bulkCreateSlots = asyncHandler(async (req, res) => {
  const { turfId, startDate, endDate, basePrice } = req.body;

  if (!turfId || !startDate || !endDate) {
    throw new ApiError(400, 'Turf ID, start date, and end date are required');
  }

  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new ApiError(404, 'Turf not found');
  }

  // Check authorization
  if (turf.owner.toString() !== req.user._id.toString() && 
      !['admin', 'superadmin'].includes(req.user.role)) {
    throw new ApiError(403, 'Not authorized to create slots for this turf');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const price = basePrice || turf.pricePerHour;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError(400, 'Invalid date format');
  }

  const daysDifference = (end - start) / (1000 * 60 * 60 * 24);
  if (daysDifference > 30) {
    throw new ApiError(400, 'Date range cannot exceed 30 days');
  }

  const createdSlots = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    try {
      const dailySlots = await TimeSlot.generateDailySlots(turfId, new Date(currentDate), price);
      createdSlots.push(...dailySlots);
    } catch (error) {
      // Slots might already exist for this date, skip
      console.log(`Slots already exist for ${currentDate.toISOString().split('T')[0]}`);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  res.status(201).json(
    new ApiResponse(201, createdSlots, `Created slots for ${createdSlots.length / 24} days`)
  );
});

// Admin: Get analytics for turf
export const getTurfAnalytics = asyncHandler(async (req, res) => {
  const { turfId } = req.params;
  const { startDate, endDate, period = 'daily' } = req.query;

  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new ApiError(404, 'Turf not found');
  }

  // Check authorization
  if (turf.owner.toString() !== req.user._id.toString() && 
      !['admin', 'superadmin'].includes(req.user.role)) {
    throw new ApiError(403, 'Not authorized to view analytics for this turf');
  }

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  let analytics;

  if (period === 'daily') {
    analytics = await BookingAnalytics.find({
      turf: turfId,
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });
  } else if (period === 'summary') {
    // Generate summary analytics
    const dailyAnalytics = await BookingAnalytics.find({
      turf: turfId,
      date: { $gte: start, $lte: end }
    });

    const summary = {
      totalDays: dailyAnalytics.length,
      totalRevenue: dailyAnalytics.reduce((sum, day) => sum + day.totalRevenue, 0),
      averageOccupancy: dailyAnalytics.length > 0 
        ? dailyAnalytics.reduce((sum, day) => sum + day.occupancyRate, 0) / dailyAnalytics.length 
        : 0,
      totalBookings: dailyAnalytics.reduce((sum, day) => sum + day.bookedSlots, 0),
      averageRevenuePerDay: dailyAnalytics.length > 0
        ? dailyAnalytics.reduce((sum, day) => sum + day.totalRevenue, 0) / dailyAnalytics.length
        : 0,
      peakHourUtilization: dailyAnalytics.length > 0
        ? dailyAnalytics.reduce((sum, day) => sum + day.peakHourBookings, 0) / dailyAnalytics.length
        : 0,
      cancellationRate: dailyAnalytics.length > 0
        ? dailyAnalytics.reduce((sum, day) => sum + day.cancellationRate, 0) / dailyAnalytics.length
        : 0,
    };

    analytics = { summary, dailyAnalytics };
  }

  res.status(200).json(
    new ApiResponse(200, analytics, 'Analytics fetched successfully')
  );
});

// Admin: Generate analytics for a specific date
export const generateAnalytics = asyncHandler(async (req, res) => {
  const { turfId } = req.params;
  const { date } = req.body;

  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new ApiError(404, 'Turf not found');
  }

  // Check authorization
  if (turf.owner.toString() !== req.user._id.toString() && 
      !['admin', 'superadmin'].includes(req.user.role)) {
    throw new ApiError(403, 'Not authorized to generate analytics for this turf');
  }

  const targetDate = date ? new Date(date) : new Date();
  
  const analytics = await BookingAnalytics.updateAnalytics(turfId, targetDate);

  res.status(200).json(
    new ApiResponse(200, analytics, 'Analytics generated successfully')
  );
});

// Admin: Update slot pricing
export const updateSlotPricing = asyncHandler(async (req, res) => {
  const { slotIds, price, priceMultiplier } = req.body;

  if (!slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
    throw new ApiError(400, 'Slot IDs are required');
  }

  if (!price && !priceMultiplier) {
    throw new ApiError(400, 'Either price or price multiplier is required');
  }

  // Get slots and verify ownership
  const slots = await TimeSlot.find({ _id: { $in: slotIds } }).populate('turf');
  
  if (slots.length === 0) {
    throw new ApiError(404, 'No slots found');
  }

  // Check authorization for each turf
  for (const slot of slots) {
    if (slot.turf.owner.toString() !== req.user._id.toString() && 
        !['admin', 'superadmin'].includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to modify slots for this turf');
    }
  }

  const updateData = {};
  if (price) {
    updateData.price = price;
  }
  if (priceMultiplier) {
    updateData.priceMultiplier = priceMultiplier;
    // If multiplier is provided, calculate price based on turf's base price
    if (!price) {
      const turf = slots[0].turf;
      updateData.price = Math.round(turf.pricePerHour * priceMultiplier);
    }
  }

  await TimeSlot.updateMany(
    { _id: { $in: slotIds } },
    updateData
  );

  const updatedSlots = await TimeSlot.find({ _id: { $in: slotIds } });

  res.status(200).json(
    new ApiResponse(200, updatedSlots, 'Slot pricing updated successfully')
  );
});

// Get daily booking report
export const getDailyReport = asyncHandler(async (req, res) => {
  const { turfId } = req.params;
  const { date } = req.query;

  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new ApiError(404, 'Turf not found');
  }

  // Check authorization
  if (turf.owner.toString() !== req.user._id.toString() && 
      !['admin', 'superadmin'].includes(req.user.role)) {
    throw new ApiError(403, 'Not authorized to view reports for this turf');
  }

  const reportDate = date ? new Date(date) : new Date();

  // Get slots for the date
  const slots = await TimeSlot.find({
    turf: turfId,
    date: reportDate
  }).sort({ slotNumber: 1 });

  // Get bookings for the date
  const bookings = await Booking.find({
    turf: turfId,
    bookingDate: reportDate
  }).populate('user', 'name email phone').populate('timeSlots');

  // Get analytics
  let analytics = await BookingAnalytics.findOne({
    turf: turfId,
    date: reportDate
  });

  if (!analytics) {
    analytics = await BookingAnalytics.updateAnalytics(turfId, reportDate);
  }

  const report = {
    date: reportDate,
    turf: {
      name: turf.name,
      location: turf.location
    },
    slots,
    bookings,
    analytics,
    summary: {
      totalSlots: slots.length,
      bookedSlots: slots.filter(s => s.status === 'booked').length,
      totalRevenue: bookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, b) => sum + b.totalPrice, 0),
      occupancyRate: slots.length > 0 
        ? (slots.filter(s => s.status === 'booked').length / slots.length) * 100 
        : 0
    }
  };

  res.status(200).json(
    new ApiResponse(200, report, 'Daily report generated successfully')
  );
});

export default {
  updateSlotAvailability,
  bulkCreateSlots,
  getTurfAnalytics,
  generateAnalytics,
  updateSlotPricing,
  getDailyReport
};
