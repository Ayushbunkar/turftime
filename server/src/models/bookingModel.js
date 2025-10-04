import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A booking must have a user']
  },
  turf: {
    type: mongoose.Schema.ObjectId,
    ref: 'Turf',
    required: [true, 'A booking must have a turf']
  },
  turfOwner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A booking must have a turf owner']
  },
  date: {
    type: Date,
    required: [true, 'A booking must have a date']
  },
  timeSlot: {
    type: String,
    required: [true, 'A booking must have a time slot']
  },
  duration: {
    type: Number,
    required: [true, 'A booking must have a duration'],
    default: 1
  },
  amount: {
    type: Number,
    required: [true, 'A booking must have an amount']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'pending'],
    default: 'pending'
  },
  paymentId: String,
  notes: String
}, {
  timestamps: true
});

// Add indexes for faster queries
bookingSchema.index({ turf: 1, date: 1 });
bookingSchema.index({ turfOwner: 1 });
bookingSchema.index({ user: 1 });

// Pre-find middleware to populate user and turf
bookingSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email'
  }).populate({
    path: 'turf',
    select: 'name location'
  });
  next();
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;