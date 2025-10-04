import mongoose from 'mongoose';

const bookingAnalyticsSchema = new mongoose.Schema(
  {
    turf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turf',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    // Daily statistics
    totalSlots: {
      type: Number,
      default: 24,
    },
    bookedSlots: {
      type: Number,
      default: 0,
    },
    availableSlots: {
      type: Number,
      default: 24,
    },
    unavailableSlots: {
      type: Number,
      default: 0,
    },
    // Revenue statistics
    totalRevenue: {
      type: Number,
      default: 0,
    },
    averagePricePerSlot: {
      type: Number,
      default: 0,
    },
    // Occupancy statistics
    occupancyRate: {
      type: Number,
      default: 0, // Percentage
    },
    peakHourBookings: {
      type: Number,
      default: 0,
    },
    offPeakBookings: {
      type: Number,
      default: 0,
    },
    // Booking patterns
    hourlyBookings: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    // User statistics
    totalBookers: {
      type: Number,
      default: 0,
    },
    repeatBookers: {
      type: Number,
      default: 0,
    },
    // Cancellation statistics
    totalCancellations: {
      type: Number,
      default: 0,
    },
    cancellationRate: {
      type: Number,
      default: 0, // Percentage
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
bookingAnalyticsSchema.index({ turf: 1, date: 1 }, { unique: true });
bookingAnalyticsSchema.index({ date: -1 });

// Static method to generate or update analytics for a date
bookingAnalyticsSchema.statics.updateAnalytics = async function(turfId, date) {
  const TimeSlot = mongoose.model('TimeSlot');
  const Booking = mongoose.models.Booking;
  
  // Get slot statistics
  const totalSlots = await TimeSlot.countDocuments({ turf: turfId, date });
  const bookedSlots = await TimeSlot.countDocuments({ 
    turf: turfId, 
    date, 
    status: 'booked' 
  });
  const availableSlots = await TimeSlot.countDocuments({ 
    turf: turfId, 
    date, 
    status: 'available' 
  });
  const unavailableSlots = totalSlots - bookedSlots - availableSlots;
  
  // Get booking statistics
  const bookings = await Booking.find({
    turf: turfId,
    bookingDate: date,
    status: { $in: ['confirmed', 'completed'] }
  }).populate('timeSlots');
  
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  const averagePricePerSlot = bookedSlots > 0 ? totalRevenue / bookedSlots : 0;
  const occupancyRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;
  
  // Calculate hourly booking patterns
  const hourlyBookings = new Map();
  for (let hour = 0; hour < 24; hour++) {
    hourlyBookings.set(hour.toString(), 0);
  }
  
  bookings.forEach(booking => {
    booking.timeSlots.forEach(slot => {
      const hour = slot.slotNumber.toString();
      hourlyBookings.set(hour, (hourlyBookings.get(hour) || 0) + 1);
    });
  });
  
  // Calculate peak hour bookings (6-11 AM, 5-10 PM)
  const peakHours = [6, 7, 8, 9, 10, 11, 17, 18, 19, 20, 21, 22];
  const peakHourBookings = peakHours.reduce((sum, hour) => {
    return sum + (hourlyBookings.get(hour.toString()) || 0);
  }, 0);
  const offPeakBookings = bookedSlots - peakHourBookings;
  
  // Get user statistics
  const uniqueBookers = new Set(bookings.map(b => b.user.toString()));
  const totalBookers = uniqueBookers.size;
  
  // Get cancellation statistics
  const cancelledBookings = await Booking.countDocuments({
    turf: turfId,
    bookingDate: date,
    status: 'cancelled'
  });
  const totalBookingAttempts = bookings.length + cancelledBookings;
  const cancellationRate = totalBookingAttempts > 0 ? (cancelledBookings / totalBookingAttempts) * 100 : 0;
  
  // Update or create analytics record
  return await this.findOneAndUpdate(
    { turf: turfId, date },
    {
      totalSlots,
      bookedSlots,
      availableSlots,
      unavailableSlots,
      totalRevenue,
      averagePricePerSlot,
      occupancyRate,
      peakHourBookings,
      offPeakBookings,
      hourlyBookings,
      totalBookers,
      totalCancellations: cancelledBookings,
      cancellationRate,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );
};

const BookingAnalytics = mongoose.models.BookingAnalytics || mongoose.model('BookingAnalytics', bookingAnalyticsSchema);

export default BookingAnalytics;