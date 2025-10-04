import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";

// Mock data for development/testing
const mockDashboardData = {
  turfCount: 3,
  bookingCount: 25,
  revenue: 12500,
  completedBookings: 20,
  pendingBookings: 5,
  recentBookings: [
    {
      _id: "mockbooking1",
      user: { name: "John Doe", email: "john@example.com" },
      turf: { name: "Green Valley Sports Complex" },
      date: new Date(),
      timeSlot: "10:00 AM - 11:00 AM",
      amount: 500,
      status: "confirmed",
      createdAt: new Date()
    },
    {
      _id: "mockbooking2", 
      user: { name: "Jane Smith", email: "jane@example.com" },
      turf: { name: "City Football Ground" },
      date: new Date(),
      timeSlot: "6:00 PM - 7:00 PM", 
      amount: 750,
      status: "pending",
      createdAt: new Date()
    }
  ],
  userCount: 150
};

const mockTurfs = [
  {
    _id: "mockturf1",
    name: "Green Valley Sports Complex",
    location: "Downtown Area, City",
    pricePerHour: 500,
    sportType: "football",
    amenities: ["parking", "changing room", "shower", "cafeteria"],
    images: ["/api/placeholder/400/300"],
    isActive: true,
    rating: 4.5,
    createdAt: new Date()
  },
  {
    _id: "mockturf2",
    name: "City Football Ground", 
    location: "North Zone, City",
    pricePerHour: 750,
    sportType: "football",
    amenities: ["parking", "changing room", "wifi"],
    images: ["/api/placeholder/400/300"],
    isActive: true,
    rating: 4.2,
    createdAt: new Date()
  },
  {
    _id: "mockturf3",
    name: "Sports Arena",
    location: "South City",
    pricePerHour: 600,
    sportType: "multiple",
    amenities: ["parking", "changing room", "shower"],
    images: ["/api/placeholder/400/300"],
    isActive: false,
    rating: 4.0,
    createdAt: new Date()
  }
];

const mockBookings = [
  {
    _id: "booking1",
    user: { name: "John Doe", email: "john@example.com" },
    turf: { name: "Green Valley Sports Complex" },
    date: new Date(),
    timeSlot: "10:00 AM - 11:00 AM",
    amount: 500,
    status: "confirmed",
    paymentMethod: "online",
    createdAt: new Date(),
    contactPhone: "+91 9876543210"
  },
  {
    _id: "booking2",
    user: { name: "Jane Smith", email: "jane@example.com" },
    turf: { name: "City Football Ground" },
    date: new Date(Date.now() + 86400000), // Tomorrow
    timeSlot: "6:00 PM - 7:00 PM",
    amount: 750,
    status: "pending", 
    paymentMethod: "pending",
    createdAt: new Date(),
    contactPhone: "+91 9876543211"
  }
];

const mockStats = {
  totalRevenue: 25000,
  totalBookings: 45,
  activeTurfs: 2,
  completionRate: 88,
  monthlyStats: [
    { month: "Jan", bookings: 12, revenue: 6000 },
    { month: "Feb", bookings: 15, revenue: 7500 },
    { month: "Mar", bookings: 18, revenue: 9000 },
    { month: "Apr", bookings: 22, revenue: 11000 }
  ],
  popularTimeSlots: [
    { timeSlot: "6:00 PM - 7:00 PM", bookings: 15 },
    { timeSlot: "7:00 PM - 8:00 PM", bookings: 12 },
    { timeSlot: "10:00 AM - 11:00 AM", bookings: 8 }
  ]
};

const mockAnalytics = {
  totalBookings: 45,
  totalRevenue: 25000,
  averageBookingValue: 555,
  bookingGrowth: 12,
  revenueGrowth: 8,
  chartData: [
    { date: "2024-01-01", bookings: 5, revenue: 2500 },
    { date: "2024-01-02", bookings: 7, revenue: 3500 },
    { date: "2024-01-03", bookings: 4, revenue: 2000 },
    { date: "2024-01-04", bookings: 9, revenue: 4500 },
    { date: "2024-01-05", bookings: 6, revenue: 3000 }
  ],
  timeSlotStats: [
    { slot: "06:00-07:00", bookings: 8, revenue: 4000 },
    { slot: "18:00-19:00", bookings: 15, revenue: 7500 },
    { slot: "19:00-20:00", bookings: 12, revenue: 6000 }
  ]
};

const mockNotifications = [
  {
    _id: "notif1",
    title: "New Booking Request",
    message: "You have a new booking request for Green Valley Sports Complex",
    type: "booking",
    isRead: false,
    createdAt: new Date()
  },
  {
    _id: "notif2", 
    title: "Payment Received",
    message: "Payment of ₹500 received for booking #BK001",
    type: "payment",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000)
  }
];

const mockSettings = {
  profile: {
    name: "Admin User",
    email: "admin@turfadmin.com", 
    phone: "+91 9876543210",
    businessName: "Sports Complex Management",
    address: "123 Sports Street, City"
  },
  preferences: {
    emailNotifications: true,
    smsNotifications: true,
    bookingReminders: true,
    theme: "light",
    language: "en"
  },
  businessHours: {
    openTime: "06:00",
    closeTime: "22:00",
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  }
};

// ======================= MOCK CONTROLLERS =======================

// Dashboard endpoint
export const getDashboardData = catchAsync(async (req, res, next) => {
  console.log("🏟️ Mock Dashboard Data Request");
  res.status(200).json(mockDashboardData);
});

// Stats endpoint  
export const getStats = catchAsync(async (req, res, next) => {
  console.log("📊 Mock Stats Request");
  res.status(200).json(mockStats);
});

// Turfs endpoint
export const getMyTurfs = catchAsync(async (req, res, next) => {
  console.log("🏟️ Mock Turfs Request");
  res.status(200).json(mockTurfs);
});

// Bookings endpoint
export const getMyBookings = catchAsync(async (req, res, next) => {
  console.log("📋 Mock Bookings Request");
  res.status(200).json(mockBookings);
});

// Recent bookings endpoint
export const getRecentBookings = catchAsync(async (req, res, next) => {
  console.log("📋 Mock Recent Bookings Request");
  res.status(200).json(mockBookings.slice(0, 5));
});

// Analytics endpoint
export const getAnalytics = catchAsync(async (req, res, next) => {
  console.log("📈 Mock Analytics Request");
  const { period = "thisMonth" } = req.query;
  
  // Modify analytics based on period
  const analytics = { ...mockAnalytics };
  if (period === "last3Months") {
    analytics.totalBookings *= 3;
    analytics.totalRevenue *= 3;
  }
  
  res.status(200).json(analytics);
});

// Notifications endpoint
export const getNotifications = catchAsync(async (req, res, next) => {
  console.log("🔔 Mock Notifications Request");
  res.status(200).json(mockNotifications);
});

// Settings endpoint
export const getSettings = catchAsync(async (req, res, next) => {
  console.log("⚙️ Mock Settings Request");
  res.status(200).json(mockSettings);
});

// Export bookings endpoint
export const exportBookings = catchAsync(async (req, res, next) => {
  console.log("📄 Mock Export Bookings Request");
  
  // Create simple CSV data
  const csvData = mockBookings.map(booking => ({
    id: booking._id,
    user: booking.user.name,
    turf: booking.turf.name,
    date: booking.date.toISOString().split('T')[0],
    timeSlot: booking.timeSlot,
    amount: booking.amount,
    status: booking.status
  }));
  
  res.status(200).json({
    success: true,
    data: csvData,
    message: "Export data ready"
  });
});

// Auth endpoints (simplified)
export const registerAdmin = catchAsync(async (req, res, next) => {
  console.log("👤 Mock Register Admin Request");
  const { name, email, password } = req.body;
  
  const mockUser = {
    _id: "mockadmin1",
    name,
    email,
    role: "turfAdmin",
    createdAt: new Date()
  };
  
  const token = jwt.sign(
    { id: mockUser._id, email: mockUser.email, role: mockUser.role },
    process.env.JWT_SECRET || "supersecretkey",
    { expiresIn: "7d" }
  );
  
  res.status(201).json({
    status: "success",
    token,
    user: mockUser
  });
});

export const loginAdmin = catchAsync(async (req, res, next) => {
  console.log("🔐 Mock Login Admin Request");
  const { email, password } = req.body;
  
  const mockUser = {
    _id: "mockadmin1", 
    name: "Admin User",
    email,
    role: "turfAdmin",
    createdAt: new Date()
  };
  
  const token = jwt.sign(
    { id: mockUser._id, email: mockUser.email, role: mockUser.role },
    process.env.JWT_SECRET || "supersecretkey", 
    { expiresIn: "7d" }
  );
  
  res.status(200).json({
    status: "success",
    token,
    user: mockUser
  });
});

// Other endpoints with basic responses
export const createTurf = catchAsync(async (req, res, next) => {
  console.log("🏟️ Mock Create Turf Request");
  const newTurf = {
    _id: "newmockturf",
    ...req.body,
    owner: req.user?.id || "mockadmin1",
    createdAt: new Date()
  };
  res.status(201).json(newTurf);
});

export const updateTurf = catchAsync(async (req, res, next) => {
  console.log("✏️ Mock Update Turf Request");
  const updatedTurf = {
    _id: req.params.id,
    ...req.body,
    updatedAt: new Date()
  };
  res.status(200).json(updatedTurf);
});

export const deleteTurf = catchAsync(async (req, res, next) => {
  console.log("🗑️ Mock Delete Turf Request");
  res.status(200).json({
    message: "Turf deleted successfully"
  });
});

export const updateBookingStatus = catchAsync(async (req, res, next) => {
  console.log("📋 Mock Update Booking Status Request");
  res.status(200).json({
    message: "Booking status updated successfully",
    booking: {
      _id: req.params.id,
      ...req.body,
      updatedAt: new Date()
    }
  });
});

export const changeAdminPassword = catchAsync(async (req, res, next) => {
  console.log("🔒 Mock Change Password Request");
  res.status(200).json({
    message: "Password changed successfully"
  });
});