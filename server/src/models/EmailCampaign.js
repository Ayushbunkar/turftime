import mongoose from 'mongoose';

const emailCampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailTemplate'
    },
    content: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'cancelled'],
      default: 'draft'
    },
    recipientType: {
      type: String,
      enum: ['all', 'users', 'turfAdmins', 'custom'],
      default: 'all'
    },
    recipients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    scheduledFor: {
      type: Date
    },
    sentAt: {
      type: Date
    },
    stats: {
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      bounced: { type: Number, default: 0 },
      unsubscribed: { type: Number, default: 0 }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for open rate
emailCampaignSchema.virtual('openRate').get(function() {
  if (this.stats.delivered === 0) return 0;
  return ((this.stats.opened / this.stats.delivered) * 100).toFixed(1);
});

// Virtual for click rate
emailCampaignSchema.virtual('clickRate').get(function() {
  if (this.stats.delivered === 0) return 0;
  return ((this.stats.clicked / this.stats.delivered) * 100).toFixed(1);
});

// Indexes
emailCampaignSchema.index({ status: 1, createdAt: -1 });
emailCampaignSchema.index({ createdBy: 1 });
emailCampaignSchema.index({ scheduledFor: 1 });

export default mongoose.model('EmailCampaign', emailCampaignSchema);
