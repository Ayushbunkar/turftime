import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['onboarding', 'notification', 'marketing', 'transactional', 'other'],
      default: 'other'
    },
    variables: [{
      type: String // e.g., {{userName}}, {{bookingId}}
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    usageCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

// Index for faster queries
emailTemplateSchema.index({ category: 1, isActive: 1 });
emailTemplateSchema.index({ name: 1 });

export default mongoose.model('EmailTemplate', emailTemplateSchema);
