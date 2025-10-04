import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema(
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
    startTime: {
      type: String, // Format: "HH:mm" (e.g., "09:00")
      required: true,
      validate: {
        validator: function(v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Invalid time format. Use HH:mm format (24-hour)'
      }
    },
    endTime: {
      type: String, // Format: "HH:mm" (e.g., "10:00")
      required: true,
      validate: {
        validator: function(v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Invalid time format. Use HH:mm format (24-hour)'
      }
    },
    slotNumber: {
      type: Number, // 0-23 for 24 hourly slots
      required: true,
      min: 0,
      max: 23
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'unavailable', 'maintenance'],
      default: 'available',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Dynamic pricing for peak/off-peak hours
    priceMultiplier: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 3
    },
    // For recurring slot creation
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringEndDate: {
      type: Date,
    },
    // Slot configuration
    maxBookings: {
      type: Number,
      default: 1, // For concurrent bookings if needed
    },
    currentBookings: {
      type: Number,
      default: 0,
    },
    // Admin controls
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedReason: {
      type: String,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
timeSlotSchema.index({ turf: 1, date: 1, slotNumber: 1 }, { unique: true });
timeSlotSchema.index({ turf: 1, date: 1, status: 1 });
timeSlotSchema.index({ date: 1, status: 1 });

// Virtual for slot display name
timeSlotSchema.virtual('displayTime').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Virtual for availability check
timeSlotSchema.virtual('isAvailable').get(function() {
  return this.status === 'available' && !this.isBlocked && this.currentBookings < this.maxBookings;
});

// Static method to generate slots for a turf and date
timeSlotSchema.statics.generateDailySlots = async function(turfId, date, basePrice = 1000) {
  const slots = [];
  const existingSlots = await this.find({ turf: turfId, date });
  
  if (existingSlots.length > 0) {
    return existingSlots; // Slots already exist for this date
  }

  for (let hour = 0; hour < 24; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${((hour + 1) % 24).toString().padStart(2, '0')}:00`;
    
    // Dynamic pricing based on time
    let priceMultiplier = 1;
    if (hour >= 6 && hour <= 11) priceMultiplier = 1.2; // Morning peak
    else if (hour >= 17 && hour <= 22) priceMultiplier = 1.5; // Evening peak
    else if (hour >= 23 || hour <= 5) priceMultiplier = 0.8; // Late night discount
    
    slots.push({
      turf: turfId,
      date,
      startTime,
      endTime,
      slotNumber: hour,
      status: 'available',
      price: Math.round(basePrice * priceMultiplier),
      priceMultiplier,
    });
  }
  
  return await this.insertMany(slots);
};

// Method to check if slot can be booked
timeSlotSchema.methods.canBook = function() {
  return this.isAvailable && new Date() < new Date(`${this.date.toISOString().split('T')[0]}T${this.startTime}:00`);
};

const TimeSlot = mongoose.models.TimeSlot || mongoose.model('TimeSlot', timeSlotSchema);

export default TimeSlot;