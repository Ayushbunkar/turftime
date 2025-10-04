import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    turf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turf',
      required: true,
    },
    timeSlots: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot',
      required: true,
    }],
    // Legacy fields for backward compatibility
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
    },
    // Enhanced booking details
    bookingDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // Duration in hours
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Booking status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'partial-refund'],
      default: 'unpaid',
    },
    // Payment details
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cash', 'upi', 'card'],
    },
    paymentId: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    // Contact details
    contactName: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    // Additional details
    teamSize: {
      type: Number,
      min: 1,
    },
    specialRequests: {
      type: String,
    },
    // Cancellation details
    cancellationReason: {
      type: String,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationDate: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    // Admin notes
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
bookingSchema.index({ user: 1, bookingDate: -1 });
bookingSchema.index({ turf: 1, bookingDate: -1 });
bookingSchema.index({ status: 1, bookingDate: -1 });
bookingSchema.index({ paymentStatus: 1 });

// Virtual for booking reference number
bookingSchema.virtual('bookingRef').get(function() {
  return `TRF-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Virtual for total duration display
bookingSchema.virtual('durationDisplay').get(function() {
  return `${this.duration} hour${this.duration > 1 ? 's' : ''}`;
});

// Virtual for booking time display
bookingSchema.virtual('timeDisplay').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Method to calculate refund amount based on cancellation policy
bookingSchema.methods.calculateRefund = function() {
  const now = new Date();
  const bookingDateTime = new Date(`${this.bookingDate.toISOString().split('T')[0]}T${this.startTime}:00`);
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  
  if (hoursUntilBooking >= 24) {
    return this.totalPrice * 0.9; // 90% refund if cancelled 24+ hours before
  } else if (hoursUntilBooking >= 6) {
    return this.totalPrice * 0.5; // 50% refund if cancelled 6-24 hours before
  } else if (hoursUntilBooking >= 2) {
    return this.totalPrice * 0.25; // 25% refund if cancelled 2-6 hours before
  } else {
    return 0; // No refund if cancelled less than 2 hours before
  }
};

// Method to check if booking can be cancelled
bookingSchema.methods.canCancel = function() {
  const now = new Date();
  const bookingDateTime = new Date(`${this.bookingDate.toISOString().split('T')[0]}T${this.startTime}:00`);
  return now < bookingDateTime && this.status !== 'cancelled' && this.status !== 'completed';
};

// Pre-save hook to set legacy fields for backward compatibility
bookingSchema.pre('save', function(next) {
  if (!this.date) {
    this.date = this.bookingDate;
  }
  if (!this.timeSlot) {
    this.timeSlot = this.timeDisplay;
  }
  next();
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;
