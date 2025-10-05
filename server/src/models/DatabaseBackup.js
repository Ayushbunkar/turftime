import mongoose from 'mongoose';

const databaseBackupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['full', 'incremental', 'differential'],
      default: 'full'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed'],
      default: 'pending'
    },
    size: {
      type: Number, // In bytes
      default: 0
    },
    location: {
      type: String, // File path or S3 URL
      trim: true
    },
    collections: [{
      name: String,
      documents: Number,
      size: Number
    }],
    duration: {
      type: Number, // In seconds
      default: 0
    },
    error: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    completedAt: {
      type: Date
    }
  },
  { 
    timestamps: true 
  }
);

// Indexes
databaseBackupSchema.index({ status: 1, createdAt: -1 });
databaseBackupSchema.index({ type: 1 });
databaseBackupSchema.index({ createdBy: 1 });

export default mongoose.model('DatabaseBackup', databaseBackupSchema);
