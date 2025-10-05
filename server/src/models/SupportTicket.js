import mongoose from 'mongoose';

const supportTicketResponseSchema = new mongoose.Schema({
  from: {
    type: String,
    enum: ['user', 'support', 'admin'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachment: {
    type: String // URL to attachment if any
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['technical', 'payment', 'billing', 'general', 'account', 'booking'],
      default: 'general'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    responses: [supportTicketResponseSchema],
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    attachments: [{
      type: String // URLs to attachments
    }],
    resolvedAt: {
      type: Date
    },
    closedAt: {
      type: Date
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for response count
supportTicketSchema.virtual('responseCount').get(function() {
  return this.responses ? this.responses.length : 0;
});

// Index for faster queries
supportTicketSchema.index({ user: 1, status: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ priority: 1, status: 1 });

// Update timestamps on status change
supportTicketSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    }
    if (this.status === 'closed' && !this.closedAt) {
      this.closedAt = new Date();
    }
  }
  next();
});

export default mongoose.model('SupportTicket', supportTicketSchema);
