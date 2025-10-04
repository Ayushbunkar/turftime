import User from '../models/userModel.js';
import Turf from '../models/Turf.js';
import Booking from '../models/Booking.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Get comprehensive dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // Aggregate queries for better performance
    const [
      totalUsers,
      totalTurfs,
      totalBookings,
      activeUsers,
      turfAdmins,
      pendingApprovals,
      revenueData
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Turf.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments({ 
        role: 'user',
        lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      User.countDocuments({ role: 'turfAdmin' }),
      User.countDocuments({ role: 'turfAdmin', status: 'pending' }),
      Booking.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            monthlyRevenue: {
              $sum: {
                $cond: [
                  {
                    $gte: ['$createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]
                  },
                  '$totalAmount',
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, monthlyRevenue: 0 };

    res.json({
      totalUsers,
      totalTurfs,
      totalBookings,
      totalRevenue: revenue.totalRevenue,
      monthlyRevenue: revenue.monthlyRevenue,
      activeUsers,
      turfAdmins,
      pendingApprovals,
      systemHealth: 98, // This would come from system monitoring
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get recent activities
export const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent user registrations
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt');

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('turf', 'name')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent turf admin registrations
    const recentAdmins = await User.find({ role: 'turfAdmin' })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name createdAt status');

    // Format activities
    const activities = [];

    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user._id}`,
        action: 'New user registration',
        user: user.name,
        time: getTimeAgo(user.createdAt),
        type: 'user',
        createdAt: user.createdAt
      });
    });

    recentBookings.forEach(booking => {
      activities.push({
        id: `booking_${booking._id}`,
        action: 'New booking created',
        user: `${booking.user?.name} at ${booking.turf?.name}`,
        time: getTimeAgo(booking.createdAt),
        type: 'booking',
        createdAt: booking.createdAt
      });
    });

    recentAdmins.forEach(admin => {
      activities.push({
        id: `admin_${admin._id}`,
        action: admin.status === 'approved' ? 'Turf admin approved' : 'New turf admin registration',
        user: admin.name,
        time: getTimeAgo(admin.createdAt),
        type: 'admin',
        createdAt: admin.createdAt
      });
    });

    // Sort by creation time and limit
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      activities: activities.slice(0, limit)
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      message: 'Failed to fetch recent activities',
      error: error.message
    });
  }
};

// Get system metrics
export const getSystemMetrics = async (req, res) => {
  try {
    // In a real application, these would come from system monitoring tools
    // For now, we'll simulate the data
    const metrics = {
      serverLoad: Math.floor(Math.random() * 30) + 15, // 15-45%
      memoryUsage: Math.floor(Math.random() * 40) + 50, // 50-90%
      diskUsage: Math.floor(Math.random() * 30) + 35, // 35-65%
      networkTraffic: Math.floor(Math.random() * 50) + 40, // 40-90%
      responseTime: Math.floor(Math.random() * 100) + 80, // 80-180ms
      activeConnections: Math.floor(Math.random() * 500) + 200,
      errorRate: Math.random() * 2, // 0-2%
      uptime: 99.8
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({
      message: 'Failed to fetch system metrics',
      error: error.message
    });
  }
};

// Get all users with pagination and filtering
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Update user status
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    if (reason) {
      user.statusReason = reason;
    }
    user.statusUpdatedAt = new Date();
    user.statusUpdatedBy = req.user.id;

    await user.save();

    res.json({
      message: 'User status updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deletion of admin users
    if (user.role === 'admin' || user.role === 'superAdmin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Get turf admins with their performance metrics
export const getTurfAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    let query = { role: 'turfAdmin' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const turfAdmins = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get performance metrics for each turf admin
    const adminsWithMetrics = await Promise.all(
      turfAdmins.map(async (admin) => {
        const [turfsCount, bookingsCount, revenue] = await Promise.all([
          Turf.countDocuments({ ownerId: admin._id }),
          Booking.countDocuments({ 
            turf: { $in: await Turf.find({ ownerId: admin._id }).select('_id') }
          }),
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
              $match: { 'turfData.ownerId': admin._id }
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' }
              }
            }
          ])
        ]);

        return {
          ...admin.toObject(),
          metrics: {
            turfsManaged: turfsCount,
            totalBookings: bookingsCount,
            totalRevenue: revenue[0]?.totalRevenue || 0
          }
        };
      })
    );

    const totalAdmins = await User.countDocuments(query);
    const totalPages = Math.ceil(totalAdmins / limit);

    res.json({
      turfAdmins: adminsWithMetrics,
      pagination: {
        currentPage: page,
        totalPages,
        totalAdmins,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching turf admins:', error);
    res.status(500).json({
      message: 'Failed to fetch turf admins',
      error: error.message
    });
  }
};

// Approve/Reject turf admin
export const updateTurfAdminStatus = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const turfAdmin = await User.findById(adminId);
    if (!turfAdmin || turfAdmin.role !== 'turfAdmin') {
      return res.status(404).json({ message: 'Turf admin not found' });
    }

    turfAdmin.status = status;
    turfAdmin.statusReason = reason;
    turfAdmin.statusUpdatedAt = new Date();
    turfAdmin.statusUpdatedBy = req.user.id;

    await turfAdmin.save();

    res.json({
      message: `Turf admin ${status} successfully`,
      admin: {
        id: turfAdmin._id,
        name: turfAdmin.name,
        email: turfAdmin.email,
        status: turfAdmin.status
      }
    });
  } catch (error) {
    console.error('Error updating turf admin status:', error);
    res.status(500).json({
      message: 'Failed to update turf admin status',
      error: error.message
    });
  }
};

// Get notifications for super admin
export const getNotifications = async (req, res) => {
  try {
    // In a real app, you'd have a notifications collection
    // For now, we'll generate dynamic notifications based on system state
    
    const [pendingAdmins, recentUsers, systemAlerts] = await Promise.all([
      User.countDocuments({ role: 'turfAdmin', status: 'pending' }),
      User.countDocuments({ 
        role: 'user',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      // System alerts would come from monitoring system
      Promise.resolve([])
    ]);

    const notifications = [];

    if (pendingAdmins > 0) {
      notifications.push({
        id: 'pending_admins',
        type: 'warning',
        title: 'Pending Turf Admin Approvals',
        message: `${pendingAdmins} turf admin(s) waiting for approval`,
        time: 'Now',
        read: false,
        priority: 'high'
      });
    }

    if (recentUsers > 0) {
      notifications.push({
        id: 'new_users',
        type: 'info',
        title: 'New User Registrations',
        message: `${recentUsers} new user(s) registered today`,
        time: '1 hour ago',
        read: false,
        priority: 'medium'
      });
    }

    // Add some system notifications
    notifications.push({
      id: 'system_backup',
      type: 'success',
      title: 'System Backup Completed',
      message: 'Daily backup completed successfully',
      time: '2 hours ago',
      read: true,
      priority: 'low'
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Create new turf admin
export const createTurfAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create turf admin
    const turfAdmin = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'turfAdmin',
      status: 'approved', // Auto-approve when created by super admin
      createdBy: req.user.id
    });

    await turfAdmin.save();

    res.status(201).json({
      message: 'Turf admin created successfully',
      admin: {
        id: turfAdmin._id,
        name: turfAdmin.name,
        email: turfAdmin.email,
        role: turfAdmin.role,
        status: turfAdmin.status
      }
    });
  } catch (error) {
    console.error('Error creating turf admin:', error);
    res.status(500).json({
      message: 'Failed to create turf admin',
      error: error.message
    });
  }
};

// Get analytics data
export const getAnalyticsData = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const [userGrowth, bookingTrends, revenueData, popularTurfs] = await Promise.all([
      // User growth over time
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            role: 'user'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      
      // Booking trends
      Booking.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      
      // Revenue analysis
      Booking.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            avgBookingValue: { $avg: '$totalAmount' },
            totalBookings: { $sum: 1 }
          }
        }
      ]),
      
      // Popular turfs
      Booking.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: '$turf',
            bookingCount: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' }
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
        {
          $unwind: '$turfData'
        },
        {
          $project: {
            name: '$turfData.name',
            location: '$turfData.location',
            bookingCount: 1,
            totalRevenue: 1
          }
        },
        { $sort: { bookingCount: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      userGrowth,
      bookingTrends,
      revenueData: revenueData[0] || { totalRevenue: 0, avgBookingValue: 0, totalBookings: 0 },
      popularTurfs,
      period,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
};

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}