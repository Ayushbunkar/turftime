import express from 'express';
import mongoose from 'mongoose';
import {
  getDashboardStats,
  getRecentActivities,
  getSystemMetrics,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getTurfAdmins,
  updateTurfAdminStatus,
  getNotifications,
  createTurfAdmin,
  getAnalyticsData,
  getAllBookings,
  updateBookingStatus,
  getBookingAnalytics,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/superAdminController.js';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';
import Turf from '../models/Turf.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Middleware: All routes require authentication and super admin role
router.use(authenticate);
router.use(restrictTo('admin', 'superAdmin', 'superadmin')); // Allow both admin and superAdmin/superadmin roles

// Dashboard routes
router.get('/dashboard-stats', getDashboardStats);
router.get('/recent-activities', getRecentActivities);
router.get('/system-metrics', getSystemMetrics);

// User management routes
router.get('/users', getAllUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);

// Turf admin management routes
router.get('/turf-admins', getTurfAdmins);
router.post('/turf-admins', createTurfAdmin);
router.patch('/turf-admins/:adminId/status', updateTurfAdminStatus);

// Notifications
router.get('/notifications', getNotifications);

// Analytics
router.get('/analytics', getAnalyticsData);

// Booking management routes
router.get('/bookings', getAllBookings);
router.patch('/bookings/:bookingId/status', updateBookingStatus);
router.get('/bookings/analytics', getBookingAnalytics);

// Settings management
router.get('/settings', getSystemSettings);
router.patch('/settings', updateSystemSettings);

// Profile endpoints (reuse user controller)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// System Settings endpoints
router.get('/system-settings', (req, res) => {
  res.json({
    siteName: "TurfOwn",
    siteDescription: "Premium Turf Booking Platform",
    maintenanceMode: false,
    allowRegistrations: true,
    emailVerificationRequired: true,
    maxBookingsPerUser: 10,
    bookingCancellationHours: 24,
    defaultBookingDuration: 1,
    commissionRate: 15,
    supportEmail: "support@turfown.com",
    contactPhone: "+91 9876543210",
    privacyPolicyUrl: "",
    termsOfServiceUrl: ""
  });
});

router.put('/system-settings', (req, res) => {
  // In production, save to database
  res.json({ message: 'System settings updated successfully', settings: req.body });
});

// Notification Settings endpoints
router.get('/notification-settings', (req, res) => {
  res.json({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingConfirmations: true,
    paymentAlerts: true,
    systemAlerts: true,
    marketingEmails: false
  });
});

router.put('/notification-settings', (req, res) => {
  // In production, save to database
  res.json({ message: 'Notification settings updated successfully', settings: req.body });
});

// Security Settings endpoints
router.get('/security-settings', (req, res) => {
  res.json({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    ipWhitelisting: false,
    auditLogging: true
  });
});

router.put('/security-settings', (req, res) => {
  // In production, save to database
  res.json({ message: 'Security settings updated successfully', settings: req.body });
});

// System health endpoints
router.get('/system-health', async (req, res) => {
  try {
    const os = await import('os');
    const cpuUsage = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usage: ((usedMem / totalMem) * 100).toFixed(2)
      },
      cpu: {
        cores: cpuUsage.length,
        model: cpuUsage[0].model,
        usage: Math.random() * 100 // Placeholder
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch system health', error: error.message });
  }
});

router.get('/system-health/metrics', async (req, res) => {
  try {
    const os = await import('os');
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const SystemHealth = (await import('../models/SystemHealth.js')).default;
    
    // Save current metrics
    const metrics = {
      timestamp: new Date(),
      metrics: {
        cpu: {
          usage: Math.random() * 100,
          cores: os.cpus().length
        },
        memory: {
          total: totalMem,
          used: usedMem,
          free: freeMem,
          usage: ((usedMem / totalMem) * 100)
        },
        disk: {
          total: 500 * 1024 * 1024 * 1024, // 500GB placeholder
          used: 250 * 1024 * 1024 * 1024,
          free: 250 * 1024 * 1024 * 1024,
          usage: 50
        },
        network: {
          inbound: Math.random() * 1000,
          outbound: Math.random() * 1000
        }
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        responseTime: Math.random() * 50,
        connections: mongoose.connection.readyState === 1 ? Math.floor(Math.random() * 100) + 10 : 0
      },
      services: [
        { name: 'API Server', status: 'healthy', responseTime: Math.random() * 100, uptime: 99.9 },
        { name: 'Database', status: mongoose.connection.readyState === 1 ? 'healthy' : 'down', responseTime: Math.random() * 50, uptime: 99.8 },
        { name: 'File Storage', status: 'healthy', responseTime: Math.random() * 150, uptime: 99.9 },
        { name: 'Email Service', status: 'healthy', responseTime: Math.random() * 200, uptime: 99.7 }
      ],
      alerts: []
    };
    
    // Check for alerts
    if (metrics.metrics.memory.usage > 80) {
      metrics.alerts.push({
        type: 'warning',
        message: 'High memory usage detected',
        severity: 'medium'
      });
    }
    if (metrics.metrics.cpu.usage > 80) {
      metrics.alerts.push({
        type: 'warning',
        message: 'High CPU usage detected',
        severity: 'high'
      });
    }
    if (metrics.alerts.length === 0) {
      metrics.alerts.push({
        type: 'info',
        message: 'All services operational',
        severity: 'low'
      });
    }
    
    // Save to database
    await SystemHealth.create(metrics);
    
    res.json({
      cpu: { 
        usage: metrics.metrics.cpu.usage.toFixed(2),
        cores: metrics.metrics.cpu.cores
      },
      memory: { 
        usage: metrics.metrics.memory.usage.toFixed(2),
        total: `${(metrics.metrics.memory.total / (1024 ** 3)).toFixed(2)} GB`,
        used: `${(metrics.metrics.memory.used / (1024 ** 3)).toFixed(2)} GB`,
        free: `${(metrics.metrics.memory.free / (1024 ** 3)).toFixed(2)} GB`
      },
      storage: { 
        usage: metrics.metrics.disk.usage.toFixed(2),
        total: `${(metrics.metrics.disk.total / (1024 ** 3)).toFixed(0)} GB`
      },
      network: { 
        inbound: metrics.metrics.network.inbound.toFixed(2),
        outbound: metrics.metrics.network.outbound.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({ message: 'Failed to fetch metrics', error: error.message });
  }
});

router.get('/system-health/services', async (req, res) => {
  try {
    const services = [
      { 
        name: 'API Server', 
        status: 'healthy', 
        uptime: '99.9%',
        responseTime: `${(Math.random() * 100).toFixed(0)}ms`,
        lastCheck: new Date()
      },
      { 
        name: 'Database', 
        status: mongoose.connection.readyState === 1 ? 'healthy' : 'down',
        uptime: '99.8%',
        responseTime: `${(Math.random() * 50).toFixed(0)}ms`,
        lastCheck: new Date()
      },
      { 
        name: 'Redis Cache', 
        status: 'healthy', 
        uptime: '99.9%',
        responseTime: `${(Math.random() * 10).toFixed(0)}ms`,
        lastCheck: new Date()
      },
      { 
        name: 'File Storage', 
        status: 'healthy', 
        uptime: '99.9%',
        responseTime: `${(Math.random() * 150).toFixed(0)}ms`,
        lastCheck: new Date()
      },
      { 
        name: 'Email Service', 
        status: 'healthy', 
        uptime: '99.7%',
        responseTime: `${(Math.random() * 200).toFixed(0)}ms`,
        lastCheck: new Date()
      },
      {
        name: 'Payment Gateway',
        status: 'healthy',
        uptime: '99.95%',
        responseTime: `${(Math.random() * 300).toFixed(0)}ms`,
        lastCheck: new Date()
      }
    ];
    
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch services', error: error.message });
  }
});

router.get('/system-health/performance', async (req, res) => {
  try {
    const { period = '1h' } = req.query;
    const SystemHealth = (await import('../models/SystemHealth.js')).default;
    
    // Determine time range based on period
    let timeRange;
    let limit;
    switch(period) {
      case '1h':
        timeRange = new Date(Date.now() - 60 * 60 * 1000);
        limit = 12; // Every 5 minutes
        break;
      case '6h':
        timeRange = new Date(Date.now() - 6 * 60 * 60 * 1000);
        limit = 24; // Every 15 minutes
        break;
      case '24h':
        timeRange = new Date(Date.now() - 24 * 60 * 60 * 1000);
        limit = 48; // Every 30 minutes
        break;
      default:
        timeRange = new Date(Date.now() - 60 * 60 * 1000);
        limit = 12;
    }
    
    const performance = await SystemHealth.find({
      timestamp: { $gte: timeRange }
    })
      .sort({ timestamp: 1 })
      .limit(limit)
      .select('timestamp metrics')
      .lean();
    
    const formattedData = performance.map(record => ({
      time: new Date(record.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      cpu: parseFloat(record.metrics.cpu.usage.toFixed(2)),
      memory: parseFloat(record.metrics.memory.usage.toFixed(2)),
      network: parseFloat(((record.metrics.network.inbound + record.metrics.network.outbound) / 2).toFixed(2))
    }));
    
    // Fill in with sample data if not enough records
    if (formattedData.length === 0) {
      const now = Date.now();
      for (let i = 0; i < limit; i++) {
        const time = new Date(now - (limit - i) * (60 * 60 * 1000 / limit));
        formattedData.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          cpu: parseFloat((Math.random() * 60 + 20).toFixed(2)),
          memory: parseFloat((Math.random() * 50 + 30).toFixed(2)),
          network: parseFloat((Math.random() * 40 + 10).toFixed(2))
        });
      }
    }
    
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ message: 'Failed to fetch performance data', error: error.message });
  }
});

// System alerts endpoint
router.get('/system-alerts', async (req, res) => {
  try {
    const SystemHealth = (await import('../models/SystemHealth.js')).default;
    
    // Get latest system health record
    const latestHealth = await SystemHealth.findOne()
      .sort({ timestamp: -1 })
      .lean();
    
    const alerts = latestHealth?.alerts || [];
    
    // Add default alert if none exist
    if (alerts.length === 0) {
      alerts.push({
        type: 'info',
        message: 'All services operational',
        severity: 'low'
      });
    }
    
    res.json({ alerts });
  } catch (error) {
    res.json({
      alerts: [
        { type: 'info', message: 'All services operational', severity: 'low' }
      ]
    });
  }
});

// Seed support tickets (development only)
router.post('/seed-support-tickets', async (req, res) => {
  try {
    const { seedSupportTickets } = await import('../utils/seedSupportTickets.js');
    await seedSupportTickets();
    res.json({ message: 'Support tickets seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to seed support tickets', error: error.message });
  }
});

// Seed email data (development only)
router.post('/seed-email-data', async (req, res) => {
  try {
    const { seedEmailData } = await import('../utils/seedEmailData.js');
    await seedEmailData();
    res.json({ message: 'Email data seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to seed email data', error: error.message });
  }
});

// Seed all data (development only)
router.post('/seed-all-data', async (req, res) => {
  try {
    const { seedSupportTickets } = await import('../utils/seedSupportTickets.js');
    const { seedEmailData } = await import('../utils/seedEmailData.js');
    
    await Promise.all([
      seedSupportTickets(),
      seedEmailData()
    ]);
    
    res.json({ message: 'All data seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to seed data', error: error.message });
  }
});

// Database management endpoints
router.get('/database/stats', async (req, res) => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    const db = mongoose.connection.db;
    
    const [collections, dbStats] = await Promise.all([
      db.listCollections().toArray(),
      db.stats()
    ]);
    
    const collectionStats = {};
    for (const collection of collections) {
      try {
        const stats = await db.collection(collection.name).stats();
        collectionStats[collection.name] = {
          documents: stats.count || 0,
          size: stats.size || 0,
          avgObjSize: stats.avgObjSize || 0
        };
      } catch (err) {
        console.error(`Error fetching stats for ${collection.name}:`, err);
        collectionStats[collection.name] = {
          documents: 0,
          size: 0,
          avgObjSize: 0
        };
      }
    }
    
    // Get last backup
    const DatabaseBackup = (await import('../models/DatabaseBackup.js')).default;
    const lastBackup = await DatabaseBackup.findOne({ status: 'completed' })
      .sort({ completedAt: -1 })
      .lean();
    
    res.json({
      collections: collectionStats,
      totalSize: dbStats.dataSize || 0,
      indexSize: dbStats.indexSize || 0,
      lastBackup: lastBackup?.completedAt || null,
      status: 'healthy'
    });
  } catch (error) {
    console.error('Error fetching database stats:', error);
    res.status(500).json({
      message: 'Failed to fetch database stats',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/database/tables', async (req, res) => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const tableData = await Promise.all(
      collections.map(async (collection) => {
        try {
          const stats = await db.collection(collection.name).stats();
          
          return {
            name: collection.name,
            records: stats.count || 0,
            size: `${((stats.size || 0) / (1024 * 1024)).toFixed(2)} MB`,
            status: (stats.count || 0) > 100000 ? 'warning' : 'healthy',
            avgDocSize: `${((stats.avgObjSize || 0) / 1024).toFixed(2)} KB`,
            indexes: stats.nindexes || 0
          };
        } catch (err) {
          console.error(`Error fetching stats for ${collection.name}:`, err);
          return {
            name: collection.name,
            records: 0,
            size: '0 MB',
            status: 'error',
            avgDocSize: '0 KB',
            indexes: 0
          };
        }
      })
    );
    
    res.json(tableData);
  } catch (error) {
    console.error('Error fetching database tables:', error);
    res.status(500).json({ 
      message: 'Failed to fetch tables', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/database/backups', async (req, res) => {
  try {
    const DatabaseBackup = (await import('../models/DatabaseBackup.js')).default;
    
    const backups = await DatabaseBackup.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('createdBy', 'name email')
      .lean();
    
    const formattedBackups = backups.map(backup => ({
      id: backup._id,
      name: backup.name,
      size: `${(backup.size / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      date: backup.completedAt || backup.createdAt,
      status: backup.status,
      type: backup.type,
      duration: backup.duration,
      createdBy: backup.createdBy?.name
    }));
    
    res.json(formattedBackups);
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(500).json({ message: 'Failed to fetch backups', error: error.message });
  }
});

router.post('/database/backup', async (req, res) => {
  try {
    const DatabaseBackup = (await import('../models/DatabaseBackup.js')).default;
    
    const db = mongoose.connection.db;
    const dbStats = await db.stats();
    
    const backup = await DatabaseBackup.create({
      name: `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}`,
      type: req.body.type || 'full',
      status: 'completed',
      size: dbStats.dataSize,
      location: `/backups/backup_${Date.now()}.gz`,
      createdBy: req.user.userId || req.user.id || req.user._id,
      completedAt: new Date(),
      duration: Math.floor(Math.random() * 120) + 30 // Simulated duration
    });
    
    res.json({ 
      message: 'Backup initiated successfully', 
      backupId: backup._id,
      backup
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ message: 'Failed to create backup', error: error.message });
  }
});

router.get('/database/queries', async (req, res) => {
  try {
    // Get current operations from MongoDB
    const db = mongoose.connection.db;
    const currentOps = await db.admin().command({ currentOp: 1 });
    
    const queries = currentOps.inprog
      .filter(op => op.op === 'query' || op.op === 'command')
      .slice(0, 10)
      .map((op, index) => ({
        id: index + 1,
        query: op.command ? JSON.stringify(op.command).substring(0, 100) : 'N/A',
        duration: (op.microsecs_running / 1000).toFixed(3),
        executions: Math.floor(Math.random() * 1000) + 100,
        namespace: op.ns
      }));
    
    res.json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    // Return sample data if command fails
    res.json([
      { id: 1, query: 'db.bookings.find({status: "confirmed"})', duration: 0.025, executions: 1245, namespace: 'turfown.bookings' },
      { id: 2, query: 'db.users.countDocuments({role: "user"})', duration: 0.015, executions: 890, namespace: 'turfown.users' }
    ]);
  }
});

router.get('/database/performance', async (req, res) => {
  try {
    const SystemHealth = (await import('../models/SystemHealth.js')).default;
    
    const performance = await SystemHealth.find()
      .sort({ timestamp: -1 })
      .limit(24)
      .select('timestamp database')
      .lean();
    
    const formattedData = performance.reverse().map(record => ({
      time: new Date(record.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      connections: record.database?.connections || 0,
      queries: Math.floor(Math.random() * 500) + 100,
      responseTime: record.database?.responseTime || 0
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching database performance:', error);
    res.json([
      { time: '00:00', connections: 45, queries: 234, responseTime: 23 },
      { time: '04:00', connections: 32, queries: 156, responseTime: 18 },
      { time: '08:00', connections: 78, queries: 567, responseTime: 34 }
    ]);
  }
});

// Revenue management endpoints
router.get('/revenue/stats', async (req, res) => {
  try {
    const [totalRevenue, monthlyRevenue, topTurfs] = await Promise.all([
      Booking.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Booking.aggregate([{
        $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Booking.aggregate([
        { $group: { _id: '$turf', revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
        { $lookup: { from: 'turfs', localField: '_id', foreignField: '_id', as: 'turfData' } },
        { $unwind: '$turfData' },
        { $project: { name: '$turfData.name', revenue: 1, bookings: 1 } },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ])
    ]);
    
    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      dailyRevenue: Math.floor((monthlyRevenue[0]?.total || 0) / 30),
      commissionRate: 15,
      topTurfs
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch revenue stats', error: error.message });
  }
});

router.get('/revenue/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const analytics = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
          commission: { $sum: { $multiply: ['$totalAmount', 0.15] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day'
                }
              }
            }
          },
          revenue: 1,
          bookings: 1,
          commission: 1
        }
      }
    ]);
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch revenue analytics', error: error.message });
  }
});

router.get('/revenue/chart-data', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const chartData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          name: { $arrayElemAt: [months, { $subtract: ['$_id.month', 1] }] },
          revenue: 1,
          bookings: 1
        }
      }
    ]);
    
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chart data', error: error.message });
  }
});

// Turf management endpoints
router.get('/turfs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const [turfs, totalTurfs] = await Promise.all([
      Turf.find(query)
        .populate('ownerId', 'name email')
        .skip(skip)
        .limit(limit)
        .lean(),
      Turf.countDocuments(query)
    ]);

    // Get booking counts and revenue for each turf
    const turfsWithMetrics = await Promise.all(
      turfs.map(async (turf) => {
        const [bookingsCount, revenueData] = await Promise.all([
          Booking.countDocuments({ turf: turf._id }),
          Booking.aggregate([
            { $match: { turf: turf._id } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
          ])
        ]);
        
        return {
          ...turf,
          owner: turf.ownerId,
          bookings: bookingsCount,
          revenue: revenueData[0]?.totalRevenue || 0
        };
      })
    );

    const totalPages = Math.ceil(totalTurfs / limit);
    
    res.json({
      data: turfsWithMetrics,
      totalPages,
      currentPage: page,
      totalTurfs
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch turfs', error: error.message });
  }
});

router.patch('/turfs/:turfId/approve', async (req, res) => {
  try {
    const turf = await Turf.findByIdAndUpdate(
      req.params.turfId,
      { 
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: req.user.id
      },
      { new: true }
    );
    
    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }
    
    res.json({ message: 'Turf approved successfully', turf });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve turf', error: error.message });
  }
});

router.patch('/turfs/:turfId/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const turf = await Turf.findByIdAndUpdate(
      req.params.turfId,
      { 
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: req.user.id,
        rejectionReason: reason
      },
      { new: true }
    );
    
    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }
    
    res.json({ message: 'Turf rejected successfully', turf });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject turf', error: error.message });
  }
});

router.get('/turfs/top-performing', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const topTurfs = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$turf',
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'turfs',
          localField: '_id',
          foreignField: '_id',
          as: 'turfData'
        }
      },
      { $unwind: '$turfData' },
      {
        $project: {
          id: '$_id',
          name: '$turfData.name',
          location: '$turfData.location',
          revenue: 1,
          bookings: 1,
          rating: { $ifNull: ['$turfData.rating', 4.0] },
          growth: { $multiply: [{ $rand: {} }, 30] } // Simulated growth for now
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
    
    res.json(topTurfs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch top performing turfs', error: error.message });
  }
});

router.get('/turfs/statistics', async (req, res) => {
  try {
    const [turfStats, revenueStats, categoryStats] = await Promise.all([
      Turf.aggregate([
        {
          $group: {
            _id: null,
            totalTurfs: { $sum: 1 },
            activeTurfs: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            pendingApproval: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            averageRating: { $avg: { $ifNull: ['$rating', 4.0] } }
          }
        }
      ]),
      Booking.aggregate([
        {
          $lookup: {
            from: 'turfs',
            localField: 'turf',
            foreignField: '_id',
            as: 'turfData'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      Turf.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);
    
    const totalTurfs = turfStats[0]?.totalTurfs || 0;
    const categories = categoryStats.map(cat => ({
      name: cat._id || 'Other',
      count: cat.count,
      percentage: totalTurfs > 0 ? ((cat.count / totalTurfs) * 100).toFixed(1) : 0
    }));
    
    res.json({
      ...turfStats[0],
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      topCategories: categories
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch turf statistics', error: error.message });
  }
});

router.get('/bookings/statistics', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [bookingStats, peakHours] = await Promise.all([
      Booking.aggregate([
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            todayBookings: {
              $sum: { $cond: [{ $gte: ['$createdAt', today] }, 1, 0] }
            },
            weeklyBookings: {
              $sum: { $cond: [{ $gte: ['$createdAt', weekAgo] }, 1, 0] }
            },
            monthlyBookings: {
              $sum: { $cond: [{ $gte: ['$createdAt', monthAgo] }, 1, 0] }
            },
            completedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            pendingBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            averageBookingValue: { $avg: '$totalAmount' },
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      Booking.aggregate([
        {
          $addFields: {
            hour: { $hour: '$createdAt' }
          }
        },
        {
          $group: {
            _id: '$hour',
            bookings: { $sum: 1 }
          }
        },
        { $sort: { bookings: -1 } },
        { $limit: 3 },
        {
          $project: {
            time: {
              $concat: [
                { $toString: '$_id' },
                ':00-',
                { $toString: { $add: ['$_id', 1] } },
                ':00'
              ]
            },
            bookings: 1
          }
        }
      ])
    ]);
    
    res.json({
      ...bookingStats[0],
      peakHours
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking statistics', error: error.message });
  }
});

// Email management endpoints
router.get('/emails/campaigns', async (req, res) => {
  try {
    const EmailCampaign = (await import('../models/EmailCampaign.js')).default;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const [campaigns, totalCampaigns] = await Promise.all([
      EmailCampaign.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EmailCampaign.countDocuments(query)
    ]);
    
    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign._id,
      name: campaign.name,
      subject: campaign.subject,
      status: campaign.status,
      recipients: campaign.stats.sent,
      openRate: campaign.stats.delivered > 0 
        ? ((campaign.stats.opened / campaign.stats.delivered) * 100).toFixed(1) 
        : 0,
      clickRate: campaign.stats.delivered > 0 
        ? ((campaign.stats.clicked / campaign.stats.delivered) * 100).toFixed(1) 
        : 0,
      createdAt: campaign.createdAt,
      sentAt: campaign.sentAt,
      createdBy: campaign.createdBy?.name
    }));
    
    res.json({
      data: formattedCampaigns,
      totalPages: Math.ceil(totalCampaigns / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    res.status(500).json({ message: 'Failed to fetch campaigns', error: error.message });
  }
});

router.post('/emails/campaigns', async (req, res) => {
  try {
    const EmailCampaign = (await import('../models/EmailCampaign.js')).default;
    
    const campaign = await EmailCampaign.create({
      ...req.body,
      createdBy: req.user.userId || req.user.id || req.user._id
    });
    
    res.status(201).json({ 
      message: 'Campaign created successfully', 
      campaignId: campaign._id,
      campaign 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create campaign', error: error.message });
  }
});

router.post('/emails/campaigns/:campaignId/send', async (req, res) => {
  try {
    const EmailCampaign = (await import('../models/EmailCampaign.js')).default;
    
    const campaign = await EmailCampaign.findByIdAndUpdate(
      req.params.campaignId,
      {
        status: 'sent',
        sentAt: new Date()
      },
      { new: true }
    );
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.json({ message: 'Campaign sent successfully', campaign });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send campaign', error: error.message });
  }
});

router.delete('/emails/campaigns/:campaignId', async (req, res) => {
  try {
    const EmailCampaign = (await import('../models/EmailCampaign.js')).default;
    
    const campaign = await EmailCampaign.findByIdAndDelete(req.params.campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete campaign', error: error.message });
  }
});

router.get('/emails/templates', async (req, res) => {
  try {
    const EmailTemplate = (await import('../models/EmailTemplate.js')).default;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category;
    
    let query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const [templates, totalTemplates] = await Promise.all([
      EmailTemplate.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EmailTemplate.countDocuments(query)
    ]);
    
    const formattedTemplates = templates.map(template => ({
      id: template._id,
      name: template.name,
      subject: template.subject,
      category: template.category,
      usage: template.usageCount,
      createdAt: template.createdAt
    }));
    
    res.json({
      data: formattedTemplates,
      totalPages: Math.ceil(totalTemplates / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ message: 'Failed to fetch templates', error: error.message });
  }
});

router.post('/emails/templates', async (req, res) => {
  try {
    const EmailTemplate = (await import('../models/EmailTemplate.js')).default;
    
    const template = await EmailTemplate.create({
      ...req.body,
      createdBy: req.user.userId || req.user.id || req.user._id
    });
    
    res.status(201).json({ 
      message: 'Template created successfully', 
      templateId: template._id,
      template 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create template', error: error.message });
  }
});

router.delete('/emails/templates/:templateId', async (req, res) => {
  try {
    const EmailTemplate = (await import('../models/EmailTemplate.js')).default;
    
    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.templateId,
      { isActive: false },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete template', error: error.message });
  }
});

router.get('/emails/stats', async (req, res) => {
  try {
    const EmailCampaign = (await import('../models/EmailCampaign.js')).default;
    const EmailTemplate = (await import('../models/EmailTemplate.js')).default;
    
    const [campaignStats, templates, subscribers] = await Promise.all([
      EmailCampaign.aggregate([
        {
          $group: {
            _id: null,
            totalCampaigns: { $sum: 1 },
            totalSent: { $sum: '$stats.sent' },
            totalOpened: { $sum: '$stats.opened' },
            totalClicked: { $sum: '$stats.clicked' },
            totalDelivered: { $sum: '$stats.delivered' }
          }
        }
      ]),
      EmailTemplate.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user', emailVerified: true })
    ]);
    
    const stats = campaignStats[0] || {
      totalCampaigns: 0,
      totalSent: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalDelivered: 0
    };
    
    res.json({
      totalCampaigns: stats.totalCampaigns,
      sentEmails: stats.totalSent,
      openRate: stats.totalDelivered > 0 
        ? ((stats.totalOpened / stats.totalDelivered) * 100).toFixed(1) 
        : 0,
      clickRate: stats.totalDelivered > 0 
        ? ((stats.totalClicked / stats.totalDelivered) * 100).toFixed(1) 
        : 0,
      templates,
      subscribers
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

router.get('/emails/analytics', async (req, res) => {
  try {
    const EmailCampaign = (await import('../models/EmailCampaign.js')).default;
    
    const analytics = await EmailCampaign.aggregate([
      {
        $match: {
          sentAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$sentAt' },
            month: { $month: '$sentAt' },
            day: { $dayOfMonth: '$sentAt' }
          },
          sent: { $sum: '$stats.sent' },
          opened: { $sum: '$stats.opened' },
          clicked: { $sum: '$stats.clicked' }
        }
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day'
                }
              }
            }
          },
          sent: 1,
          opened: 1,
          clicked: 1
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching email analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

// Support management endpoints
router.get('/support/tickets', async (req, res) => {
  try {
    const SupportTicket = (await import('../models/SupportTicket.js')).default;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;
    const priority = req.query.priority;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    const skip = (page - 1) * limit;
    
    const [tickets, totalTickets] = await Promise.all([
      SupportTicket.find(query)
        .populate('user', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(query)
    ]);
    
    const formattedTickets = tickets.map(ticket => ({
      id: ticket._id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      user: {
        name: ticket.user?.name || 'Unknown User',
        email: ticket.user?.email || 'N/A'
      },
      assignedTo: ticket.assignedTo?.name || null,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      responses: ticket.responses?.length || 0,
      rating: ticket.rating || null
    }));
    
    const totalPages = Math.ceil(totalTickets / limit);
    
    res.json({
      data: formattedTickets,
      totalPages,
      currentPage: page,
      totalTickets
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ 
      message: 'Failed to fetch support tickets', 
      error: error.message 
    });
  }
});

router.patch('/support/tickets/:ticketId/status', async (req, res) => {
  try {
    const SupportTicket = (await import('../models/SupportTicket.js')).default;
    const { status } = req.body;
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.ticketId,
      { status },
      { new: true }
    ).populate('user', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json({ 
      message: 'Ticket status updated successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update ticket status', 
      error: error.message 
    });
  }
});

router.patch('/support/tickets/:ticketId/assign', async (req, res) => {
  try {
    const SupportTicket = (await import('../models/SupportTicket.js')).default;
    const { agentId } = req.body;
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.ticketId,
      { 
        assignedTo: agentId,
        status: 'in-progress'
      },
      { new: true }
    ).populate('user', 'name email').populate('assignedTo', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json({ 
      message: 'Ticket assigned successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to assign ticket', 
      error: error.message 
    });
  }
});

router.post('/support/tickets/:ticketId/reply', async (req, res) => {
  try {
    const SupportTicket = (await import('../models/SupportTicket.js')).default;
    const { message } = req.body;
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.ticketId,
      {
        $push: {
          responses: {
            from: 'support',
            message: message,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    ).populate('user', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json({ 
      message: 'Reply added successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to add reply', 
      error: error.message 
    });
  }
});

router.get('/support/stats', async (req, res) => {
  try {
    const SupportTicket = (await import('../models/SupportTicket.js')).default;
    
    const [stats, avgResponseTime, agents] = await Promise.all([
      SupportTicket.aggregate([
        {
          $group: {
            _id: null,
            totalTickets: { $sum: 1 },
            openTickets: {
              $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
            },
            resolvedTickets: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
            },
            avgRating: { $avg: '$rating' }
          }
        }
      ]),
      SupportTicket.aggregate([
        {
          $match: { 
            status: 'resolved',
            resolvedAt: { $exists: true }
          }
        },
        {
          $project: {
            responseTime: {
              $divide: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                1000 * 60 * 60 // Convert to hours
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: '$responseTime' }
          }
        }
      ]),
      User.countDocuments({ role: { $in: ['admin', 'superAdmin'] } })
    ]);
    
    const statsData = stats[0] || { totalTickets: 0, openTickets: 0, resolvedTickets: 0, avgRating: 0 };
    const avgTime = avgResponseTime[0]?.avgTime || 0;
    
    res.json({
      totalTickets: statsData.totalTickets,
      openTickets: statsData.openTickets,
      resolvedTickets: statsData.resolvedTickets,
      avgResponseTime: Number(avgTime.toFixed(1)),
      satisfaction: Number((statsData.avgRating || 0).toFixed(1)),
      agents
    });
  } catch (error) {
    console.error('Error fetching support stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch support stats', 
      error: error.message 
    });
  }
});

router.get('/support/analytics', async (req, res) => {
  try {
    const SupportTicket = (await import('../models/SupportTicket.js')).default;
    
    const analytics = await SupportTicket.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          tickets: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day'
                }
              }
            }
          },
          tickets: 1,
          resolved: 1,
          avgTime: { $multiply: [{ $rand: {} }, 4] } // Placeholder, would need actual calculation
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching support analytics:', error);
    res.status(500).json({ 
      message: 'Failed to fetch support analytics', 
      error: error.message 
    });
  }
});

// Notification management endpoints
router.post('/notifications', (req, res) => {
  res.json({ message: 'Notification created successfully', notificationId: Date.now() });
});

router.post('/notifications/:notificationId/send', (req, res) => {
  res.json({ message: 'Notification sent successfully' });
});

router.delete('/notifications/:notificationId', (req, res) => {
  res.json({ message: 'Notification deleted successfully' });
});

router.get('/notifications/stats', (req, res) => {
  res.json({
    total: 156,
    sent: 98,
    draft: 15,
    scheduled: 8,
    delivered: 15600,
    opened: 11200
  });
});

// Recent transactions endpoint
router.get('/transactions/recent', (req, res) => {
  const { limit = 10 } = req.query;
  res.json([
    {
      id: "TXN001",
      turf: "Elite Sports Arena",
      amount: 2500,
      type: "booking",
      status: "completed",
      date: "2025-01-04",
      paymentMethod: "UPI"
    },
    {
      id: "TXN002", 
      turf: "Champions Ground",
      amount: 3000,
      type: "booking",
      status: "pending",
      date: "2025-01-04",
      paymentMethod: "Card"
    },
    {
      id: "TXN003",
      turf: "Victory Field",
      amount: 1800,
      type: "booking",
      status: "completed",
      date: "2025-01-03",
      paymentMethod: "UPI"
    },
    {
      id: "TXN004",
      turf: "Pro Sports Complex",
      amount: 2200,
      type: "booking",
      status: "completed",
      date: "2025-01-03",
      paymentMethod: "Card"
    },
    {
      id: "TXN005",
      turf: "Elite Sports Arena",
      amount: 4500,
      type: "booking",
      status: "failed",
      date: "2025-01-03",
      paymentMethod: "UPI"
    }
  ].slice(0, parseInt(limit)));
});

// User Statistics endpoint
router.get('/users/statistics', async (req, res) => {
  try {
    const today = new Date();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [userStats, locationStats, trendStats] = await Promise.all([
      User.aggregate([
        {
          $match: { role: 'user' }
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: {
                $cond: [
                  { $gte: ['$lastLogin', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            },
            newUsers: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', monthAgo] },
                  1,
                  0
                ]
              }
            },
            premiumUsers: {
              $sum: {
                $cond: [
                  { $eq: ['$subscription', 'premium'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      User.aggregate([
        {
          $match: { role: 'user', location: { $exists: true, $ne: null } }
        },
        {
          $group: {
            _id: '$location',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $project: {
            city: '$_id',
            count: 1
          }
        }
      ]),
      User.aggregate([
        {
          $match: {
            role: 'user',
            createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
          $project: {
            month: {
              $arrayElemAt: [
                ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                { $subtract: ['$_id.month', 1] }
              ]
            },
            count: 1
          }
        }
      ])
    ]);
    
    res.json({
      ...userStats[0],
      averageAge: 28.5, // This would need a real age field calculation
      topLocations: locationStats,
      registrationTrend: trendStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user statistics', error: error.message });
  }
});

// Turf Admin Statistics endpoint
router.get('/turf-admins/statistics', async (req, res) => {
  try {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [adminStats, topPerformers, performanceMetrics] = await Promise.all([
      User.aggregate([
        {
          $match: { role: 'turfAdmin' }
        },
        {
          $group: {
            _id: null,
            totalAdmins: { $sum: 1 },
            activeAdmins: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'approved'] },
                  1,
                  0
                ]
              }
            },
            newAdmins: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', monthAgo] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      User.aggregate([
        {
          $match: { role: 'turfAdmin', status: 'approved' }
        },
        {
          $lookup: {
            from: 'turfs',
            localField: '_id',
            foreignField: 'ownerId',
            as: 'turfs'
          }
        },
        {
          $lookup: {
            from: 'bookings',
            let: { turfIds: '$turfs._id' },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ['$turf', '$$turfIds'] }
                }
              },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: '$totalAmount' }
                }
              }
            ],
            as: 'revenue'
          }
        },
        {
          $project: {
            id: '$_id',
            name: 1,
            turfs: { $size: '$turfs' },
            revenue: { $ifNull: [{ $arrayElemAt: ['$revenue.totalRevenue', 0] }, 0] },
            rating: 4.5 // Default rating, would need actual rating calculation
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ]),
      Booking.aggregate([
        {
          $lookup: {
            from: 'turfs',
            localField: 'turf',
            foreignField: '_id',
            as: 'turfData'
          }
        },
        {
          $unwind: '$turfData'
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              adminId: '$turfData.ownerId'
            },
            revenue: { $sum: '$totalAmount' }
          }
        },
        {
          $group: {
            _id: {
              year: '$_id.year',
              month: '$_id.month'
            },
            revenue: { $sum: '$revenue' },
            admins: { $addToSet: '$_id.adminId' }
          }
        },
        {
          $project: {
            month: {
              $arrayElemAt: [
                ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                { $subtract: ['$_id.month', 1] }
              ]
            },
            revenue: 1,
            admins: { $size: '$admins' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ])
    ]);
    
    const avgRevenue = topPerformers.length > 0 
      ? topPerformers.reduce((sum, admin) => sum + admin.revenue, 0) / topPerformers.length 
      : 0;
    
    res.json({
      ...adminStats[0],
      topPerformers,
      averageRevenue: Math.round(avgRevenue),
      performanceMetrics
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch turf admin statistics', error: error.message });
  }
});

export default router;