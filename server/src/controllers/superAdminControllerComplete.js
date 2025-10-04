import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Admin from '../models/Admin.js';
import Turf from '../models/Turf.js';
import Booking from '../models/Booking.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import catchAsync from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import { sendEmail } from '../utils/sendEmailNew.js';

// ==================== DASHBOARD & ANALYTICS ====================

/**
 * Get comprehensive dashboard stats for Super Admin
 */
export const getDashboardStats = catchAsync(async (req, res) => {
  // Aggregate queries for better performance
  const [
    totalUsers,
    totalTurfs,
    totalBookings,
    activeUsers,
    turfAdmins,
    pendingApprovals,
    revenueData,
    platformStats
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Turf.countDocuments(),
    Booking.countDocuments(),
    User.countDocuments({ 
      role: 'user',
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }),
    Admin.countDocuments({ role: { $in: ['turfadmin', 'admin'] } }),
    Admin.countDocuments({ status: 'pending' }),
    Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          avgBookingValue: { $avg: '$totalPrice' },
          thisMonthRevenue: {
            $sum: {
              $cond: [
                {
                  $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)]
                },
                '$totalPrice',
                0
              ]
            }
          }
        }
      }
    ]),
    // Additional platform statistics
    Promise.all([
      Turf.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ])
  ]);

  const revenue = revenueData[0] || { totalRevenue: 0, avgBookingValue: 0, thisMonthRevenue: 0 };
  const [turfsByStatus, bookingsByStatus] = platformStats;

  // Recent activities
  const recentActivities = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).limit(5).select('name email createdAt role'),
    Admin.find({}).sort({ createdAt: -1 }).limit(5).select('name email createdAt status'),
    Booking.find({})
      .populate('user', 'name email')
      .populate('turf', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('user turf totalPrice status createdAt')
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalUsers,
        totalTurfs,
        totalBookings,
        activeUsers,
        turfAdmins,
        pendingApprovals
      },
      revenue: {
        total: revenue.totalRevenue,
        thisMonth: revenue.thisMonthRevenue,
        averageBooking: revenue.avgBookingValue
      },
      turfsByStatus: turfsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentActivities: {
        newUsers: recentActivities[0],
        newAdmins: recentActivities[1],
        recentBookings: recentActivities[2]
      }
    }
  });
});

/**
 * Get system metrics and performance data
 */
export const getSystemMetrics = catchAsync(async (req, res) => {
  const metrics = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString(),
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      collections: {
        users: await User.countDocuments(),
        admins: await Admin.countDocuments(),
        turfs: await Turf.countDocuments(),
        bookings: await Booking.countDocuments()
      }
    },
    environment: process.env.NODE_ENV || 'development'
  };

  res.status(200).json({
    status: 'success',
    data: metrics
  });
});

/**
 * Get recent platform activities
 */
export const getRecentActivities = catchAsync(async (req, res) => {
  const { limit = 20, type = 'all' } = req.query;

  const activities = [];

  if (type === 'all' || type === 'users') {
    const newUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 4)
      .select('name email createdAt role');
    
    newUsers.forEach(user => {
      activities.push({
        type: 'user_registered',
        timestamp: user.createdAt,
        data: { name: user.name, email: user.email, role: user.role },
        message: `New user ${user.name} registered`
      });
    });
  }

  if (type === 'all' || type === 'admins') {
    const newAdmins = await Admin.find({})
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 4)
      .select('name email createdAt status');
    
    newAdmins.forEach(admin => {
      activities.push({
        type: 'admin_registered',
        timestamp: admin.createdAt,
        data: { name: admin.name, email: admin.email, status: admin.status },
        message: `New admin ${admin.name} registered`
      });
    });
  }

  if (type === 'all' || type === 'turfs') {
    const newTurfs = await Turf.find({})
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 4)
      .select('name owner createdAt isActive');
    
    newTurfs.forEach(turf => {
      activities.push({
        type: 'turf_created',
        timestamp: turf.createdAt,
        data: { name: turf.name, owner: turf.owner?.name, isActive: turf.isActive },
        message: `New turf "${turf.name}" created by ${turf.owner?.name}`
      });
    });
  }

  if (type === 'all' || type === 'bookings') {
    const recentBookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('turf', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 4)
      .select('user turf totalPrice status createdAt');
    
    recentBookings.forEach(booking => {
      activities.push({
        type: 'booking_created',
        timestamp: booking.createdAt,
        data: { 
          user: booking.user?.name, 
          turf: booking.turf?.name, 
          amount: booking.totalPrice, 
          status: booking.status 
        },
        message: `${booking.user?.name} booked ${booking.turf?.name} for ₹${booking.totalPrice}`
      });
    });
  }

  // Sort all activities by timestamp
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.status(200).json({
    status: 'success',
    data: activities.slice(0, parseInt(limit))
  });
});

// ==================== USER MANAGEMENT ====================

/**
 * Get all users with filtering and pagination
 */
export const getAllUsers = catchAsync(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    role = 'all', 
    status = 'all',
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  if (role !== 'all') {
    filter.role = role;
  }
  if (status !== 'all') {
    filter.isActive = status === 'active';
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const users = await User.find(filter)
    .select('-password')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Update user status (activate/deactivate)
 */
export const updateUserStatus = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { isActive, reason } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Send notification to user
  if (!isActive && reason) {
    await sendEmail({
      email: user.email,
      subject: 'Account Status Update - TurfHub',
      message: `
        <h2>Account Status Update</h2>
        <p>Hi ${user.name},</p>
        <p>Your account has been temporarily suspended.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>If you believe this is an error, please contact our support team.</p>
        <br>
        <p>Best regards,<br>TurfHub Team</p>
      `
    });
  }

  res.status(200).json({
    status: 'success',
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
});

/**
 * Delete user account
 */
export const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Check if user has active bookings
  const activeBookings = await Booking.countDocuments({
    user: userId,
    status: { $in: ['confirmed', 'pending'] },
    bookingDate: { $gte: new Date() }
  });

  if (activeBookings > 0) {
    return res.status(400).json({
      status: 'error',
      message: `Cannot delete user with ${activeBookings} active booking(s). Please cancel or complete bookings first.`
    });
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully'
  });
});

// ==================== TURF ADMIN MANAGEMENT ====================

/**
 * Get all turf admins with filtering
 */
export const getTurfAdmins = catchAsync(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status = 'all',
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const filter = {};
  if (status !== 'all') {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { turfName: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const admins = await Admin.find(filter)
    .select('-password')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await Admin.countDocuments(filter);

  // Get turf counts for each admin
  const adminsWithTurfCount = await Promise.all(
    admins.map(async (admin) => {
      const turfCount = await Turf.countDocuments({ owner: admin._id });
      return {
        ...admin.toObject(),
        turfCount
      };
    })
  );

  res.status(200).json({
    status: 'success',
    data: {
      admins: adminsWithTurfCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAdmins: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Create new turf admin
 */
export const createTurfAdmin = catchAsync(async (req, res) => {
  const { name, email, password, turfName, phoneNumber } = req.body;

  // Validation
  if (!name || !email || !password || !turfName || !phoneNumber) {
    return res.status(400).json({
      status: 'error',
      message: 'All fields are required'
    });
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({
      status: 'error',
      message: 'Admin with this email already exists'
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create admin
  const admin = new Admin({
    name,
    email,
    password: hashedPassword,
    role: 'turfadmin',
    turfName,
    phoneNumber,
    status: 'approved' // Super admin created accounts are auto-approved
  });

  await admin.save();

  // Send welcome email
  await sendEmail({
    email: admin.email,
    subject: 'Welcome to TurfHub - Admin Account Created',
    message: `
      <h2>Welcome to TurfHub!</h2>
      <p>Hi ${admin.name},</p>
      <p>Your admin account has been created successfully.</p>
      <p><strong>Login Details:</strong></p>
      <ul>
        <li>Email: ${admin.email}</li>
        <li>Login URL: ${req.protocol}://${req.get('host')}/login</li>
      </ul>
      <p>You can now start adding and managing your turfs.</p>
      <br>
      <p>Best regards,<br>TurfHub Team</p>
    `
  });

  res.status(201).json({
    status: 'success',
    message: 'Turf admin created successfully',
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        turfName: admin.turfName,
        status: admin.status
      }
    }
  });
});

/**
 * Update turf admin status
 */
export const updateTurfAdminStatus = catchAsync(async (req, res) => {
  const { adminId } = req.params;
  const { status, reason } = req.body;

  if (!['pending', 'approved', 'suspended', 'rejected'].includes(status)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid status'
    });
  }

  const admin = await Admin.findByIdAndUpdate(
    adminId,
    { status },
    { new: true, runValidators: true }
  ).select('-password');

  if (!admin) {
    return res.status(404).json({
      status: 'error',
      message: 'Admin not found'
    });
  }

  // Send notification email
  const statusMessages = {
    approved: 'Your admin account has been approved! You can now log in and start managing your turfs.',
    suspended: `Your admin account has been suspended. ${reason ? 'Reason: ' + reason : ''}`,
    rejected: `Your admin account application has been rejected. ${reason ? 'Reason: ' + reason : ''}`
  };

  if (statusMessages[status]) {
    await sendEmail({
      email: admin.email,
      subject: `Account Status Update - TurfHub`,
      message: `
        <h2>Account Status Update</h2>
        <p>Hi ${admin.name},</p>
        <p>${statusMessages[status]}</p>
        ${status === 'approved' ? `<p><a href="${req.protocol}://${req.get('host')}/login">Login to your account</a></p>` : ''}
        <br>
        <p>Best regards,<br>TurfHub Team</p>
      `
    });
  }

  res.status(200).json({
    status: 'success',
    message: `Admin ${status} successfully`,
    data: admin
  });
});

// ==================== PLATFORM SETTINGS ====================

/**
 * Get platform settings
 */
export const getPlatformSettings = catchAsync(async (req, res) => {
  // This would typically come from a Settings collection
  // For now, return default settings
  const settings = {
    platform: {
      name: 'TurfHub',
      commission: 10, // 10% commission
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    },
    booking: {
      maxAdvanceBookingDays: 30,
      cancellationWindowHours: 24,
      autoConfirmBookings: false
    },
    payment: {
      allowedGateways: ['razorpay', 'stripe'],
      defaultGateway: 'razorpay',
      refundPolicy: 'auto' // auto, manual, disabled
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true
    }
  };

  res.status(200).json({
    status: 'success',
    data: settings
  });
});

/**
 * Update platform settings
 */
export const updatePlatformSettings = catchAsync(async (req, res) => {
  const { settings } = req.body;

  // In a real app, this would update a Settings collection
  // For now, just validate and return the settings

  res.status(200).json({
    status: 'success',
    message: 'Settings updated successfully',
    data: settings
  });
});

// ==================== ANALYTICS & REPORTS ====================

/**
 * Get analytics data for super admin
 */
export const getAnalyticsData = catchAsync(async (req, res) => {
  const { period = '30d', metrics = 'all' } = req.query;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }

  const analytics = {};

  // Revenue analytics
  if (metrics === 'all' || metrics === 'revenue') {
    analytics.revenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
  }

  // User growth analytics
  if (metrics === 'all' || metrics === 'users') {
    analytics.userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
  }

  // Turf performance analytics
  if (metrics === 'all' || metrics === 'turfs') {
    analytics.turfPerformance = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'confirmed'
        }
      },
      {
        $lookup: {
          from: 'turfs',
          localField: 'turf',
          foreignField: '_id',
          as: 'turfDetails'
        }
      },
      {
        $group: {
          _id: '$turf',
          turfName: { $first: { $arrayElemAt: ['$turfDetails.name', 0] } },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
  }

  res.status(200).json({
    status: 'success',
    data: {
      period,
      analytics
    }
  });
});

// ==================== NOTIFICATIONS ====================

/**
 * Get platform notifications
 */
export const getNotifications = catchAsync(async (req, res) => {
  // This would typically come from a Notifications collection
  // For now, return mock notifications
  const notifications = [
    {
      id: 1,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday 2AM - 4AM',
      priority: 'medium',
      read: false,
      createdAt: new Date()
    },
    {
      id: 2,
      type: 'alert',
      title: 'High Booking Volume',
      message: '500+ bookings in the last 24 hours',
      priority: 'low',
      read: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  res.status(200).json({
    status: 'success',
    data: notifications
  });
});