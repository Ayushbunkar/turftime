import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Recipient information
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientType: {
    type: String,
    enum: ['user', 'admin', 'all'],
    default: 'user'
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_confirmed',
      'booking_cancelled',
      'payment_success',
      'payment_failed',
      'turf_approved',
      'turf_rejected',
      'admin_approved',
      'admin_suspended',
      'system_maintenance',
      'promotional',
      'reminder',
      'general'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Delivery channels
  channels: {
    email: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      deliveredAt: Date,
      error: String
    },
    sms: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      deliveredAt: Date,
      error: String
    },
    push: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      deliveredAt: Date,
      error: String
    },
    inApp: {
      enabled: { type: Boolean, default: true },
      read: { type: Boolean, default: false },
      readAt: Date
    }
  },
  
  // Metadata and context
  metadata: {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    turfId: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf' },
    paymentId: String,
    action: String, // e.g., 'view_booking', 'retry_payment'
    actionUrl: String
  },
  
  // Scheduling
  scheduledFor: Date,
  expiresAt: Date,
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled'],
    default: 'pending'
  },
  retryCount: {
    type: Number,
    default: 0,
    max: 3
  },
  
  // Template information
  template: {
    name: String,
    variables: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ 'channels.inApp.read': 1, recipient: 1 });

// Virtual for total delivery status
notificationSchema.virtual('isDelivered').get(function() {
  return this.channels.email.sent || this.channels.sms.sent || this.channels.push.sent;
});

// Method to mark as read (for in-app notifications)
notificationSchema.methods.markAsRead = function() {
  this.channels.inApp.read = true;
  this.channels.inApp.readAt = new Date();
  return this.save();
};

// Method to update delivery status
notificationSchema.methods.updateDeliveryStatus = function(channel, status, error = null) {
  if (this.channels[channel]) {
    this.channels[channel].sent = status === 'sent' || status === 'delivered';
    if (status === 'sent') {
      this.channels[channel].sentAt = new Date();
    } else if (status === 'delivered') {
      this.channels[channel].deliveredAt = new Date();
    } else if (status === 'failed') {
      this.channels[channel].error = error;
      this.retryCount += 1;
    }
  }
  
  // Update overall status
  if (this.isDelivered) {
    this.status = 'delivered';
  } else if (status === 'failed' && this.retryCount >= 3) {
    this.status = 'failed';
  }
  
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;