import User from '../models/userModel.js';
import Booking from '../models/Booking.js';
import catchAsync from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import mongoose from 'mongoose';

// ==================== USER PROFILE MANAGEMENT ====================

/**
 * Get user profile with enhanced details
 */
export const getUserProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-password -passwordResetToken -passwordResetExpires')
    .lean();

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Get user statistics
  const stats = await Booking.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);

  const userStats = stats[0] || {
    totalBookings: 0,
    totalSpent: 0,
    completedBookings: 0,
    cancelledBookings: 0
  };

  // Calculate membership level based on bookings
  let membershipLevel = 'Bronze';
  if (userStats.totalBookings >= 50) membershipLevel = 'Platinum';
  else if (userStats.totalBookings >= 25) membershipLevel = 'Gold';
  else if (userStats.totalBookings >= 10) membershipLevel = 'Silver';

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        ...user,
        membershipLevel,
        completionRate: userStats.totalBookings > 0 
          ? Math.round((userStats.completedBookings / userStats.totalBookings) * 100)
          : 0
      },
      stats: userStats
    }
  });
});

/**
 * Update user profile
 */
export const updateUserProfile = catchAsync(async (req, res) => {
  const allowedFields = [
    'firstName', 
    'lastName', 
    'phoneNumber', 
    'dateOfBirth',
    'profilePicture',
    'preferences',
    'address'
  ];

  const updateData = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  // Validate phone number format if provided
  if (updateData.phoneNumber) {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(updateData.phoneNumber)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid phone number format'
      });
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 
      ...updateData,
      updatedAt: new Date()
    },
    { 
      new: true, 
      runValidators: true,
      select: '-password -passwordResetToken -passwordResetExpires'
    }
  );

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: { user }
  });
});

/**
 * Update user preferences
 */
export const updateUserPreferences = catchAsync(async (req, res) => {
  const { notifications, privacy, booking } = req.body;

  const preferences = {};
  
  if (notifications) {
    preferences['preferences.notifications'] = {
      email: notifications.email || false,
      sms: notifications.sms || false,
      push: notifications.push || true,
      booking: notifications.booking || true,
      promotional: notifications.promotional || false
    };
  }

  if (privacy) {
    preferences['preferences.privacy'] = {
      shareProfile: privacy.shareProfile || false,
      showBookings: privacy.showBookings || false,
      shareLocation: privacy.shareLocation || false
    };
  }

  if (booking) {
    preferences['preferences.booking'] = {
      autoConfirm: booking.autoConfirm || false,
      defaultDuration: booking.defaultDuration || 60,
      reminders: booking.reminders || true,
      favoriteLocations: booking.favoriteLocations || []
    };
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: preferences },
    { 
      new: true,
      select: '-password -passwordResetToken -passwordResetExpires'
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Preferences updated successfully',
    data: { preferences: user.preferences }
  });
});

/**
 * Delete user account
 */
export const deleteUserAccount = catchAsync(async (req, res) => {
  const { password, confirmDelete } = req.body;

  if (confirmDelete !== 'DELETE MY ACCOUNT') {
    return res.status(400).json({
      status: 'error',
      message: 'Please type "DELETE MY ACCOUNT" to confirm account deletion'
    });
  }

  // Verify password
  const user = await User.findById(req.user.id);
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Incorrect password'
    });
  }

  // Check for active bookings
  const activeBookings = await Booking.countDocuments({
    user: req.user.id,
    status: { $in: ['confirmed', 'pending'] },
    date: { $gte: new Date() }
  });

  if (activeBookings > 0) {
    return res.status(400).json({
      status: 'error',
      message: `Cannot delete account with ${activeBookings} active booking(s). Please cancel your bookings first.`
    });
  }

  // Soft delete - mark as inactive instead of removing
  await User.findByIdAndUpdate(req.user.id, {
    status: 'inactive',
    deactivatedAt: new Date(),
    email: `deleted_${Date.now()}_${user.email}` // Prevent email conflicts
  });

  res.status(200).json({
    status: 'success',
    message: 'Account deleted successfully'
  });
});

// ==================== USER BOOKING HISTORY ====================

/**
 * Get user booking history with advanced filtering
 */
export const getUserBookingHistory = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status = 'all',
    dateFrom,
    dateTo,
    turfType,
    location,
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query;

  // Build filter query
  const filter = { user: req.user.id };

  if (status !== 'all') {
    filter.status = status;
  }

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  // Sort options
  const sortOptions = {};
  if (sortBy === 'date') {
    sortOptions.date = sortOrder === 'desc' ? -1 : 1;
  } else if (sortBy === 'amount') {
    sortOptions.totalAmount = sortOrder === 'desc' ? -1 : 1;
  } else {
    sortOptions.createdAt = -1;
  }

  const bookings = await Booking.find(filter)
    .populate('turf', 'name images location amenities pricePerHour')
    .populate('timeSlot', 'startTime endTime')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Booking.countDocuments(filter);

  // Calculate summary statistics
  const summaryStats = await Booking.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$totalAmount' },
        totalBookings: { $sum: 1 },
        avgBookingValue: { $avg: '$totalAmount' },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);

  const summary = summaryStats[0] || {
    totalSpent: 0,
    totalBookings: 0,
    avgBookingValue: 0,
    completedBookings: 0
  };

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      summary,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Get user favorite turfs
 */
export const getUserFavorites = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'favorites',
      populate: {
        path: 'admin',
        select: 'firstName lastName businessName'
      }
    })
    .select('favorites');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Get booking count for each favorite turf
  const favoritesWithStats = await Promise.all(
    user.favorites.map(async (turf) => {
      const bookingCount = await Booking.countDocuments({
        user: req.user.id,
        turf: turf._id,
        status: 'completed'
      });

      const lastBooking = await Booking.findOne({
        user: req.user.id,
        turf: turf._id
      }).sort({ createdAt: -1 }).select('date createdAt');

      return {
        ...turf.toObject(),
        userStats: {
          bookingCount,
          lastBooking: lastBooking?.date
        }
      };
    })
  );

  res.status(200).json({
    status: 'success',
    data: {
      favorites: favoritesWithStats,
      count: favoritesWithStats.length
    }
  });
});

/**
 * Add/remove turf from favorites
 */
export const toggleFavorite = catchAsync(async (req, res) => {
  const { turfId } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  const isFavorite = user.favorites.includes(turfId);

  if (isFavorite) {
    // Remove from favorites
    user.favorites.pull(turfId);
  } else {
    // Add to favorites
    user.favorites.push(turfId);
  }

  await user.save();

  res.status(200).json({
    status: 'success',
    message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
    data: {
      isFavorite: !isFavorite,
      favoritesCount: user.favorites.length
    }
  });
});

// ==================== USER ANALYTICS ====================

/**
 * Get user activity analytics
 */
export const getUserAnalytics = catchAsync(async (req, res) => {
  const { period = '6m' } = req.query;
  const userId = req.user.id;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '1m':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case '3m':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6m':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 6);
  }

  // Monthly booking trends
  const monthlyTrends = await Booking.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        bookings: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        avgAmount: { $avg: '$totalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Favorite time slots
  const timeSlotAnalysis = await Booking.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: 'completed'
      }
    },
    {
      $lookup: {
        from: 'timeslots',
        localField: 'timeSlot',
        foreignField: '_id',
        as: 'timeSlotInfo'
      }
    },
    { $unwind: '$timeSlotInfo' },
    {
      $group: {
        _id: '$timeSlotInfo.startTime',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Sports preference
  const sportsAnalysis = await Booking.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: 'completed'
      }
    },
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfInfo'
      }
    },
    { $unwind: '$turfInfo' },
    { $unwind: '$turfInfo.sports' },
    {
      $group: {
        _id: '$turfInfo.sports',
        count: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      period,
      monthlyTrends,
      favoriteTimeSlots: timeSlotAnalysis,
      sportsPreferences: sportsAnalysis,
      summary: {
        totalPeriodBookings: monthlyTrends.reduce((sum, month) => sum + month.bookings, 0),
        totalPeriodSpent: monthlyTrends.reduce((sum, month) => sum + month.totalSpent, 0),
        avgMonthlyBookings: monthlyTrends.length > 0 
          ? monthlyTrends.reduce((sum, month) => sum + month.bookings, 0) / monthlyTrends.length 
          : 0
      }
    }
  });
});

/**
 * Get user recommendations
 */
export const getUserRecommendations = catchAsync(async (req, res) => {
  const userId = req.user.id;

  // Get user's booking history to understand preferences
  const userBookings = await Booking.find({
    user: userId,
    status: 'completed'
  }).populate('turf').lean();

  if (userBookings.length === 0) {
    return res.status(200).json({
      status: 'success',
      message: 'No recommendations available yet. Make your first booking!',
      data: { recommendations: [] }
    });
  }

  // Analyze user preferences
  const preferences = {
    sports: {},
    locations: {},
    timeSlots: {},
    priceRange: { min: Infinity, max: 0 }
  };

  userBookings.forEach(booking => {
    // Sports preference
    booking.turf.sports?.forEach(sport => {
      preferences.sports[sport] = (preferences.sports[sport] || 0) + 1;
    });

    // Location preference
    if (booking.turf.location?.city) {
      const city = booking.turf.location.city;
      preferences.locations[city] = (preferences.locations[city] || 0) + 1;
    }

    // Price range
    preferences.priceRange.min = Math.min(preferences.priceRange.min, booking.turf.pricePerHour);
    preferences.priceRange.max = Math.max(preferences.priceRange.max, booking.turf.pricePerHour);
  });

  // Get top preferences
  const topSports = Object.keys(preferences.sports).sort(
    (a, b) => preferences.sports[b] - preferences.sports[a]
  ).slice(0, 3);

  // TODO: Implement recommendation algorithm based on:
  // 1. Similar users' bookings
  // 2. Popular turfs in preferred locations
  // 3. New turfs matching user's sports
  // 4. Seasonal recommendations
  // 5. Promotional offers

  const mockRecommendations = [
    {
      type: 'similar_users',
      title: 'Popular with similar users',
      description: 'Other users with similar preferences loved these turfs'
    },
    {
      type: 'new_turfs',
      title: 'New turfs in your area',
      description: 'Recently added turfs matching your preferences'
    },
    {
      type: 'promotional',
      title: 'Special offers',
      description: 'Limited time deals on your favorite sports'
    }
  ];

  res.status(200).json({
    status: 'success',
    data: {
      recommendations: mockRecommendations,
      userPreferences: {
        topSports,
        preferredLocations: Object.keys(preferences.locations).slice(0, 3),
        priceRange: preferences.priceRange.min !== Infinity ? preferences.priceRange : null
      }
    }
  });
});