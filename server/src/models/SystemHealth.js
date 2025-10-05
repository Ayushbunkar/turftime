import mongoose from 'mongoose';

const systemHealthSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    },
    metrics: {
      cpu: {
        usage: { type: Number, required: true }, // Percentage
        cores: { type: Number }
      },
      memory: {
        total: { type: Number, required: true }, // In bytes
        used: { type: Number, required: true }, // In bytes
        free: { type: Number, required: true }, // In bytes
        usage: { type: Number, required: true } // Percentage
      },
      disk: {
        total: { type: Number, required: true }, // In bytes
        used: { type: Number, required: true }, // In bytes
        free: { type: Number, required: true }, // In bytes
        usage: { type: Number, required: true } // Percentage
      },
      network: {
        inbound: { type: Number, default: 0 }, // KB/s
        outbound: { type: Number, default: 0 } // KB/s
      }
    },
    services: [{
      name: { type: String, required: true },
      status: { 
        type: String, 
        enum: ['healthy', 'degraded', 'down'],
        required: true 
      },
      responseTime: { type: Number }, // In milliseconds
      uptime: { type: Number } // Percentage
    }],
    database: {
      status: { 
        type: String, 
        enum: ['connected', 'disconnected', 'error'],
        required: true 
      },
      responseTime: { type: Number }, // In milliseconds
      connections: { type: Number }
    },
    alerts: [{
      type: { 
        type: String, 
        enum: ['info', 'warning', 'error', 'critical'],
        required: true 
      },
      message: { type: String, required: true },
      severity: { 
        type: String, 
        enum: ['low', 'medium', 'high'],
        required: true 
      }
    }]
  },
  { 
    timestamps: true 
  }
);

// Index for time-series queries
systemHealthSchema.index({ timestamp: -1 });

// Auto-delete old records after 7 days
systemHealthSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export default mongoose.model('SystemHealth', systemHealthSchema);
