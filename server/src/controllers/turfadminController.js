import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import fsSync from "fs";
import { deleteFromCloudinary, extractPublicId, isCloudinaryEnabled } from "../config/cloudinary.js";
import Turf from "../models/Turf.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Models (resolved lazily to avoid circular imports)
let User = null;
let Booking = null;
let Admin = null;

function ensureModels() {
  if (User && Booking && Admin) {
    console.log('✅ All models already available');
    return;
  }
  
  console.log('🔄 Initializing models...');
  const models = mongoose.models || {};
  console.log('📋 Available models:', Object.keys(models));
  
  try {
    User = User || models.User || mongoose.model("User");
    console.log('✅ User model loaded:', !!User);
  } catch (error) {
    console.log('❌ User model error:', error.message);
  }
  
  try {
    // Turf is now imported directly at the top
    console.log('✅ Turf model loaded:', !!Turf);
  } catch (error) {
    console.log('❌ Turf model error:', error.message);
  }
  
  try {
    Booking = Booking || models.Booking || mongoose.models.Booking;
    console.log('✅ Booking model loaded:', !!Booking);
  } catch (error) {
    console.log('❌ Booking model error:', error.message);
  }
  
  try {
    Admin = Admin || models.Admin || mongoose.model("Admin");
    console.log('✅ Admin model loaded:', !!Admin);
  } catch (error) {
    console.log('❌ Admin model error:', error.message);
  }
}

// -------------------- AUTH --------------------

export const registerAdmin = catchAsync(async (req, res, next) => {
  ensureModels();
  const { name, email, password, turfName, phoneNumber, secretKey } = req.body;

  if (!name || !email || !password || !turfName || !phoneNumber || !secretKey) {
    return next(
      new AppError("All fields including secretKey are required", 400)
    );
  }

  if (secretKey !== process.env.TURF_ADMIN_SECRET) {
    return next(new AppError("Invalid secret key", 403));
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) return next(new AppError("Email already in use", 409));

  const hashedPassword = await bcrypt.hash(password, 12);

  const newAdmin = new Admin({
    name,
    email,
    password: hashedPassword,
    role: ["turfadmin", "user"],
    turfName,
    phoneNumber,
  });

  await newAdmin.save();
  res
    .status(201)
    .json({
      message: "Turf Admin registered successfully",
      adminId: newAdmin._id,
    });
});

export const loginAdmin = catchAsync(async (req, res, next) => {
  ensureModels();
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Email and password are required", 400));

  const admin = await Admin.findOne({ email });
  if (!admin) return next(new AppError("Admin not found", 404));

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return next(new AppError("Invalid credentials", 401));

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({
    message: "Login successful",
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      turfName: admin.turfName,
      phoneNumber: admin.phoneNumber,
    },
  });
});

export const changeAdminPassword = catchAsync(async (req, res, next) => {
  ensureModels();
  const adminId = req.user?.id;
  const { oldPassword, newPassword } = req.body;

  if (!adminId) return next(new AppError("Unauthorized", 401));
  if (!oldPassword || !newPassword)
    return next(new AppError("Old and new password are required", 400));

  const admin = await Admin.findById(adminId);
  if (!admin) return next(new AppError("Admin not found", 404));

  const isMatch = await bcrypt.compare(oldPassword, admin.password);
  if (!isMatch) return next(new AppError("Old password is incorrect", 401));

  admin.password = await bcrypt.hash(newPassword, 12);
  await admin.save();

  res.status(200).json({ message: "Password changed successfully" });
});

// -------------------- DASHBOARD --------------------

export const getDashboardData = catchAsync(async (req, res, next) => {
  try {
    console.log('📊 Dashboard data request started');
    ensureModels();
    console.log('✅ Models ensured for dashboard');
    
    const userId = req.user?.id;
    console.log('👤 User ID from token:', userId);
    
    if (!userId) {
      console.log('❌ No user ID found in dashboard request');
      return next(new AppError("Unauthorized", 401));
    }

    console.log('📊 Getting dashboard data for user:', userId);

  const [turfCount, bookingAgg, userCount] = await Promise.all([
    Turf.countDocuments({ owner: userId }),
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
        $match: { 
          'turfData.owner': new mongoose.Types.ObjectId(userId) 
        } 
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { 
            $sum: { 
              $ifNull: [
                '$totalPrice', 
                { $ifNull: ['$price', 0] }
              ]
            } 
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
        },
      },
    ]),
    User.countDocuments({ role: "user" }),
  ]);

  const recentBookings = await Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    { 
      $match: { 
        'turfData.owner': new mongoose.Types.ObjectId(userId) 
      } 
    },
    { $sort: { createdAt: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData'
      }
    },
    {
      $addFields: {
        turf: { $arrayElemAt: ['$turfData', 0] },
        user: { $arrayElemAt: ['$userData', 0] }
      }
    },
    {
      $project: {
        _id: 1,
        bookingDate: 1,
        startTime: 1,
        endTime: 1,
        totalPrice: 1,
        price: 1,
        status: 1,
        createdAt: 1,
        'user.name': 1,
        'user.email': 1,
        'turf.name': 1
      }
    }
  ]);

  const agg = bookingAgg[0] || {};
  console.log('📊 Dashboard data aggregation result:', agg);
  console.log('📊 Recent bookings count:', recentBookings.length);
  
  res.status(200).json({
    turfCount,
    bookingCount: agg.count || 0,
    revenue: agg.revenue || 0,
    completedBookings: agg.completed || 0,
    pendingBookings: agg.pending || 0,
    recentBookings,
    userCount,
  });
  
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    console.error('❌ Dashboard error stack:', error.stack);
    return next(new AppError(`Dashboard failed: ${error.message}`, 500));
  }
});

export const getStats = catchAsync(async (req, res, next) => {
  ensureModels();
  const userId = req.user?.id;
  if (!userId) return next(new AppError("Unauthorized", 401));

  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const [turfs, bookingsResult, revenueAgg, users] = await Promise.all([
    Turf.countDocuments({ owner: userId }),
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
        $match: { 
          'turfData.owner': new mongoose.Types.ObjectId(userId) 
        } 
      },
      { $count: 'totalBookings' }
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
        $match: { 
          'turfData.owner': new mongoose.Types.ObjectId(userId) 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { 
            $sum: { 
              $ifNull: [
                '$totalPrice', 
                { $ifNull: ['$price', 0] }
              ]
            } 
          } 
        } 
      }
    ]),
    User.countDocuments({ role: "user" }),
  ]);

  const bookingCount = bookingsResult[0]?.totalBookings || 0;

  const currentRevenue = revenueAgg[0]?.total || 0;

  res.status(200).json({
    turfCount: turfs,
    bookingCount: bookingCount,
    revenue: currentRevenue,
    userCount: users,
  });
});

// -------------------- TURF MANAGEMENT --------------------

export const getMyTurfs = catchAsync(async (req, res) => {
  ensureModels();
  
  console.log('📋 TurfAdmin getting my turfs - User:', req.user.id);
  
  // Database statistics with collection info
  const collectionName = Turf.collection.collectionName;
  console.log('🔍 Using collection:', collectionName);
  
  const totalCount = await Turf.countDocuments({});
  const activeCount = await Turf.countDocuments({ isActive: true });
  const myCount = await Turf.countDocuments({ owner: req.user.id });
  
  console.log(`🔢 TurfAdmin Database stats: Total=${totalCount}, Active=${activeCount}, Mine=${myCount}`);
  
  const turfs = await Turf.find({ owner: req.user.id })
    .sort({ createdAt: -1 })
    .populate('owner', 'name email')
    .lean();
  
  console.log(`✅ TurfAdmin: Found ${turfs.length} turfs for owner ${req.user.id}`);
  
  // Also check raw collection
  try {
    const db = mongoose.connection.db;
    const rawCount = await db.collection(collectionName).countDocuments({ owner: mongoose.Types.ObjectId(req.user.id) });
    console.log(`📊 Raw collection count for owner: ${rawCount}`);
  } catch (rawError) {
    console.log('⚠️ Raw collection check failed:', rawError.message);
  }
    
  res.status(200).json({
    status: 'success',
    results: turfs.length,
    data: turfs
  });
});

export const createTurf = catchAsync(async (req, res, next) => {
  try {
    ensureModels();
    
    console.log('🏟️ Create turf request started');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📁 Files received:', req.files?.length || 0);
    console.log('👤 User ID:', req.user?.id);
    
    // Validate required fields
    const { name, address, description, pricePerHour, sportType } = req.body;
    
    if (!name || !address || !description || !pricePerHour || !sportType) {
      return next(new AppError('All required fields must be provided: name, address, description, pricePerHour, sportType', 400));
    }
    
    if (!req.user?.id) {
      return next(new AppError('User authentication required', 401));
    }
    
    // Handle images from uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => {
        if (file.path && file.path.includes('cloudinary')) {
          console.log('☁️ Cloudinary image:', file.path);
          return file.path;
        } else {
          console.log('💾 Local image:', `/uploads/${file.filename}`);
          return `/uploads/${file.filename}`;
        }
      });
    }
    
    console.log('🖼️ Processed images:', images);
    
    // Handle amenities parsing
    let amenities = [];
    if (req.body.amenities) {
      if (typeof req.body.amenities === "string") {
        try {
          amenities = JSON.parse(req.body.amenities);
        } catch (err) {
          console.log('⚠️ Error parsing amenities, using empty array:', err.message);
          amenities = [];
        }
      } else if (Array.isArray(req.body.amenities)) {
        amenities = req.body.amenities;
      }
    }

    // Validate and convert price
    const price = Number(pricePerHour);
    if (isNaN(price) || price <= 0) {
      return next(new AppError('Price per hour must be a valid positive number', 400));
    }

    // Create turf data object (avoid 'location' field to prevent geo conflicts)
    const turfData = {
      name: name.trim(),
      address: address.trim(), // Use 'address' field consistently
      description: description.trim(),
      pricePerHour: price,
      sportType: sportType.trim(),
      owner: new mongoose.Types.ObjectId(req.user.id),
      images,
      amenities,
      isActive: true,
      surface: req.body.surface?.trim() || 'Artificial Grass',
      capacity: Number(req.body.capacity) || 22,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('🏗️ Creating turf with validated data:', {
      ...turfData,
      owner: turfData.owner.toString()
    });

    // Create turf with error handling
    let turf;
    try {
      turf = await Turf.create(turfData);
      console.log('✅ Turf created successfully via Mongoose');
    } catch (createError) {
      console.log('⚠️ Mongoose create failed:', createError.message);
      
      // Try alternative creation method
      try {
        const db = mongoose.connection.db;
        const collectionName = Turf.collection.collectionName;
        console.log('� Trying direct DB insertion to collection:', collectionName);
        
        const insertResult = await db.collection(collectionName).insertOne(turfData);
        console.log('✅ Direct DB insertion successful, ID:', insertResult.insertedId);
        
        // Fetch the created turf
        turf = await Turf.findById(insertResult.insertedId);
        
        if (!turf) {
          throw new Error('Created turf not found in database');
        }
      } catch (altError) {
        console.error('❌ Alternative creation failed:', altError.message);
        return next(new AppError(`Failed to create turf: ${altError.message}`, 500));
      }
    }
    
    // Verify turf was created
    if (!turf) {
      return next(new AppError('Turf creation failed: No turf object created', 500));
    }
    
    // Try to populate owner info
    try {
      if (turf.populate && typeof turf.populate === 'function') {
        await turf.populate('owner', 'name email');
      }
    } catch (populateError) {
      console.log('⚠️ Owner populate failed:', populateError.message);
    }

    console.log('🎉 Turf creation completed successfully');
    console.log('� Created turf summary:', {
      id: turf._id,
      name: turf.name,
      owner: turf.owner,
      isActive: turf.isActive
    });

    res.status(201).json({ 
      status: "success", 
      message: "Turf created successfully",
      data: turf 
    });
    
  } catch (error) {
    console.error('❌ Create turf error:', error);
    console.error('❌ Error stack:', error.stack);
    return next(new AppError(`Turf creation failed: ${error.message}`, 500));
  }
});

export const updateTurf = catchAsync(async (req, res, next) => {
  ensureModels();
  const { id } = req.params;
  const turf = await Turf.findOne({ _id: id, owner: req.user.id });
  if (!turf) return next(new AppError("Turf not found", 404));

  const newImages = req.files?.map((f) => f.path || f.filename) || [];
  const updatedImages = [...(turf.images || []), ...newImages];

  let amenities = req.body.amenities;
  if (typeof amenities === "string") {
    try {
      amenities = JSON.parse(amenities);
    } catch {}
  }

  const updatedTurf = await Turf.findByIdAndUpdate(
    id,
    { ...req.body, images: updatedImages, amenities: amenities || turf.amenities },
    { new: true, runValidators: true }
  );

  res.status(200).json({ status: "success", data: updatedTurf });
});

export const deleteTurf = catchAsync(async (req, res, next) => {
  ensureModels();
  const turf = await Turf.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!turf) return next(new AppError("Turf not found", 404));
  res.status(204).json({ status: "success", data: null });
});

// -------------------- BOOKINGS --------------------

export const getMyBookings = catchAsync(async (req, res) => {
  ensureModels();
  const bookings = await Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    { 
      $match: { 
        'turfData.owner': new mongoose.Types.ObjectId(req.user.id) 
      } 
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData'
      }
    },
    {
      $addFields: {
        turf: { $arrayElemAt: ['$turfData', 0] },
        user: { $arrayElemAt: ['$userData', 0] }
      }
    },
    { $sort: { bookingDate: -1, createdAt: -1 } },
    {
      $project: {
        _id: 1,
        bookingDate: 1,
        date: 1,
        startTime: 1,
        endTime: 1,
        totalPrice: 1,
        price: 1,
        status: 1,
        paymentStatus: 1,
        contactName: 1,
        contactPhone: 1,
        contactEmail: 1,
        teamSize: 1,
        specialRequests: 1,
        createdAt: 1,
        'user.name': 1,
        'user.email': 1,
        'turf.name': 1
      }
    }
  ]);
  res.status(200).json(bookings);
});

export const getRecentBookings = catchAsync(async (req, res) => {
  ensureModels();
  const bookings = await Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    { 
      $match: { 
        'turfData.owner': new mongoose.Types.ObjectId(req.user.id) 
      } 
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData'
      }
    },
    {
      $addFields: {
        turf: { $arrayElemAt: ['$turfData', 0] },
        user: { $arrayElemAt: ['$userData', 0] }
      }
    },
    { $sort: { createdAt: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 1,
        bookingDate: 1,
        startTime: 1,
        endTime: 1,
        totalPrice: 1,
        price: 1,
        status: 1,
        createdAt: 1,
        'user.name': 1,
        'user.email': 1,
        'turf.name': 1
      }
    }
  ]);
  res.status(200).json(bookings);
});

export const updateBookingStatus = catchAsync(async (req, res, next) => {
  ensureModels();
  const { id } = req.params;
  const { status } = req.body;
  
  // First check if this booking belongs to the admin's turf
  const bookingWithTurf = await Booking.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) }
    },
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    {
      $match: {
        'turfData.owner': new mongoose.Types.ObjectId(req.user.id)
      }
    }
  ]);
  
  if (!bookingWithTurf || bookingWithTurf.length === 0) {
    return next(new AppError("Booking not found", 404));
  }
  
  const booking = await Booking.findById(id);
  if (!booking) return next(new AppError("Booking not found", 404));

  booking.status = status;
  await booking.save();
  res.status(200).json({ status: "success", data: booking });
});

export const exportBookings = catchAsync(async (req, res, next) => {
  ensureModels();
  const bookings = await Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    { 
      $match: { 
        'turfData.owner': new mongoose.Types.ObjectId(req.user.id) 
      } 
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData'
      }
    },
    {
      $addFields: {
        turf: { $arrayElemAt: ['$turfData', 0] },
        user: { $arrayElemAt: ['$userData', 0] }
      }
    }
  ]);

  const rows = bookings.map((b) => ({
    id: b._id.toString(),
    userName: b.user?.name || "Unknown",
    userEmail: b.user?.email || "Unknown",
    turfName: b.turf?.name || "Unknown",
    location: b.turf?.location || "Unknown",
    date: b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : (b.date ? new Date(b.date).toLocaleDateString() : ""),
    amount: b.totalPrice || b.price || 0,
    status: b.status || "",
  }));

  const tempDir = path.join(__dirname, "..", "..", "temp");
  if (!fsSync.existsSync(tempDir)) await fs.mkdir(tempDir, { recursive: true });

  const fileName = `bookings-${Date.now()}.csv`;
  const filePath = path.join(tempDir, fileName);

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "id", title: "Booking ID" },
      { id: "userName", title: "User Name" },
      { id: "userEmail", title: "User Email" },
      { id: "turfName", title: "Turf Name" },
      { id: "location", title: "Location" },
      { id: "date", title: "Date" },
      { id: "amount", title: "Amount" },
      { id: "status", title: "Status" },
    ],
  });

  await csvWriter.writeRecords(rows);
  res.download(filePath, fileName, async () => {
    try {
      await fs.unlink(filePath);
    } catch {}
  });
});

//   registerAdmin,     // For registering turf admins (with secret key)
  // loginAdmin,        // For both superadmin & turfadmin login
  // getAllUsers,       // View all users (admin-only)
  // getAllBookings,    // View all bookings (admin-only)
  // changeAdminPassword, // Change password for Turf Admin
  // getAdminStats,
  // getAdminRecentActivities


export const getAdminRecentActivities = catchAsync(async (req, res, next) => {
  ensureModels();
  // Example: Fetch last 10 bookings and last 10 turfs created by this admin
  const adminId = req.user?.id;
  if (!adminId) return next(new AppError("Unauthorized", 401));

  const recentBookings = await Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    { 
      $match: { 
        'turfData.owner': new mongoose.Types.ObjectId(adminId) 
      } 
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData'
      }
    },
    {
      $addFields: {
        turf: { $arrayElemAt: ['$turfData', 0] },
        user: { $arrayElemAt: ['$userData', 0] }
      }
    },
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 1,
        bookingDate: 1,
        startTime: 1,
        endTime: 1,
        totalPrice: 1,
        price: 1,
        status: 1,
        createdAt: 1,
        'user.name': 1,
        'user.email': 1,
        'turf.name': 1
      }
    }
  ]);

  const recentTurfs = await Turf.find({ owner: adminId })
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    recentBookings,
    recentTurfs,
  });
});

// -------------------- ANALYTICS --------------------

export const getAnalytics = catchAsync(async (req, res, next) => {
  try {
    console.log('🔍 Analytics request started');
    ensureModels();
    console.log('✅ Models ensured');
    
    const adminId = req.user?.id;
    console.log('👤 Admin ID from token:', adminId);
    console.log('👤 Full user object:', JSON.stringify(req.user, null, 2));
    
    if (!adminId) {
      console.log('❌ No admin ID found in request');
      return next(new AppError("Unauthorized", 401));
    }

    console.log('🔍 Analytics request for admin:', adminId);
    const { period = 'thisMonth' } = req.query;
    console.log('📅 Period requested:', period);
  
  // Calculate date ranges based on period
  const now = new Date();
  let startDate, endDate = now;
  
  switch (period) {
    case 'thisWeek':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      break;
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last3Months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case 'thisYear':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Get current period stats by joining with Turf collection
  const currentBookingsQuery = Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    {
      $match: {
        'turfData.owner': new mongoose.Types.ObjectId(adminId),
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $count: 'totalBookings'
    }
  ]);

  const currentRevenueQuery = Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    {
      $match: {
        'turfData.owner': new mongoose.Types.ObjectId(adminId),
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['completed', 'confirmed'] }
      }
    },
    {
      $group: { 
        _id: null, 
        total: { 
          $sum: { 
            $ifNull: [
              '$totalPrice', 
              { $ifNull: ['$price', 0] }
            ]
          } 
        } 
      }
    }
  ]);

  const [currentBookingsResult, currentRevenue] = await Promise.all([
    currentBookingsQuery,
    currentRevenueQuery
  ]);

  const currentBookings = currentBookingsResult[0]?.totalBookings || 0;

  // Get previous period for comparison
  const prevStartDate = new Date(startDate);
  const prevEndDate = new Date(startDate);
  const diffTime = endDate.getTime() - startDate.getTime();
  prevStartDate.setTime(startDate.getTime() - diffTime);

  const prevBookingsQuery = Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    {
      $match: {
        'turfData.owner': new mongoose.Types.ObjectId(adminId),
        createdAt: { $gte: prevStartDate, $lte: prevEndDate }
      }
    },
    {
      $count: 'totalBookings'
    }
  ]);

  const prevRevenueQuery = Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    {
      $match: {
        'turfData.owner': new mongoose.Types.ObjectId(adminId),
        createdAt: { $gte: prevStartDate, $lte: prevEndDate },
        status: { $in: ['completed', 'confirmed'] }
      }
    },
    {
      $group: { 
        _id: null, 
        total: { 
          $sum: { 
            $ifNull: [
              '$totalPrice', 
              { $ifNull: ['$price', 0] }
            ]
          } 
        } 
      }
    }
  ]);

  const [prevBookingsResult, prevRevenue] = await Promise.all([
    prevBookingsQuery,
    prevRevenueQuery
  ]);

  const prevBookings = prevBookingsResult[0]?.totalBookings || 0;

  // Calculate growth percentages
  const currentRevenueTotal = currentRevenue[0]?.total || 0;
  const prevRevenueTotal = prevRevenue[0]?.total || 0;
  
  const bookingGrowth = prevBookings > 0 ? ((currentBookings - prevBookings) / prevBookings * 100) : 0;
  const revenueGrowth = prevRevenueTotal > 0 ? ((currentRevenueTotal - prevRevenueTotal) / prevRevenueTotal * 100) : 0;

  // Get customer analytics using aggregation
  const totalCustomersQuery = Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    {
      $match: {
        'turfData.owner': new mongoose.Types.ObjectId(adminId)
      }
    },
    {
      $group: {
        _id: '$user'
      }
    },
    {
      $count: 'totalCustomers'
    }
  ]);

  const newCustomersQuery = Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    {
      $match: {
        'turfData.owner': new mongoose.Types.ObjectId(adminId),
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$user'
      }
    },
    {
      $count: 'newCustomers'
    }
  ]);

  const [totalCustomersResult, newCustomersResult] = await Promise.all([
    totalCustomersQuery,
    newCustomersQuery
  ]);

  const totalCustomers = totalCustomersResult[0]?.totalCustomers || 0;
  const newCustomers = newCustomersResult[0]?.newCustomers || 0;

  // Get turf performance
  const totalTurfs = await Turf.countDocuments({ owner: adminId });
  
  const turfPerformance = await Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    {
      $match: {
        'turfData.owner': new mongoose.Types.ObjectId(adminId)
      }
    },
    { 
      $group: {
        _id: '$turf',
        bookings: { $sum: 1 },
        revenue: { 
          $sum: { 
            $ifNull: [
              '$totalPrice', 
              { $ifNull: ['$price', 0] }
            ]
          } 
        }
      }
    },
    { $lookup: { from: 'turfs', localField: '_id', foreignField: '_id', as: 'turfInfo' } },
    { $unwind: '$turfInfo' },
    {
      $match: {
        'turfInfo.owner': new mongoose.Types.ObjectId(adminId)
      }
    },
    { $sort: { bookings: -1 } },
    { $limit: 5 }
  ]);

  const mostBookedTurf = turfPerformance[0]?.turfInfo?.name || 'N/A';
  
  // Calculate utilization rate (simplified)
  const totalPossibleSlots = totalTurfs * 12 * 30; // 12 slots per day, 30 days
  const utilization = totalPossibleSlots > 0 ? Math.min((currentBookings / totalPossibleSlots * 100), 100) : 0;

  console.log('📊 Analytics data:', {
    currentBookings,
    currentRevenueTotal,
    prevBookings,
    prevRevenueTotal,
    totalCustomers,
    newCustomers,
    totalTurfs,
    mostBookedTurf
  });

  res.status(200).json({
    analytics: {
      revenue: {
        thisMonth: currentRevenueTotal,
        lastMonth: prevRevenueTotal,
        growth: Math.round(revenueGrowth * 10) / 10
      },
      bookings: {
        thisMonth: currentBookings,
        lastMonth: prevBookings,
        growth: Math.round(bookingGrowth * 10) / 10
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomers,
        returnRate: totalCustomers > 0 ? Math.round((totalCustomers - newCustomers) / totalCustomers * 100) : 0
      },
      turfs: {
        totalTurfs,
        mostBooked: mostBookedTurf,
        utilizationRate: Math.round(utilization)
      }
    },
    charts: {
      revenueChart: [], // Could be populated with weekly/daily data
      turfPerformance: turfPerformance.map(t => ({
        name: t.turfInfo.name,
        bookings: t.bookings,
        revenue: t.revenue
      })),
      timeSlotAnalysis: [] // Could be populated with time slot data
    }
  });
  
  } catch (error) {
    console.error('❌ Analytics error:', error);
    console.error('❌ Error stack:', error.stack);
    return next(new AppError(`Analytics failed: ${error.message}`, 500));
  }
});

// -------------------- PROFILE --------------------

export const updateProfile = catchAsync(async (req, res, next) => {
  ensureModels();
  const adminId = req.user?.id;
  if (!adminId) return next(new AppError("Unauthorized", 401));

  const { name, email, phone, address, businessName, description } = req.body;
  
  const updatedAdmin = await Admin.findByIdAndUpdate(
    adminId,
    {
      name,
      email,
      phone,
      address,
      businessName,
      description
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    user: updatedAdmin
  });
});

// -------------------- SETTINGS --------------------

export const getSettings = catchAsync(async (req, res) => {
  // Default settings structure
  const defaultSettings = {
    notifications: {
      emailBookings: true,
      emailCancellations: true,
      emailPayments: true,
      smsReminders: false,
      pushNotifications: true
    },
    business: {
      autoConfirmBookings: false,
      cancellationPolicy: "24",
      operatingHours: {
        start: "06:00",
        end: "23:00"
      }
    },
    security: {
      loginNotifications: true
    }
  };

  res.status(200).json({
    status: 'success',
    settings: defaultSettings
  });
});

export const updateSettings = catchAsync(async (req, res) => {
  const { section, settings } = req.body;
  
  // In a real app, you'd save these to the database
  // For now, just return success
  res.status(200).json({
    status: 'success',
    message: `${section} settings updated successfully`,
    settings
  });
});

// -------------------- NOTIFICATIONS --------------------

export const getNotifications = catchAsync(async (req, res) => {
  // Mock notifications data
  const notifications = [
    {
      _id: '1',
      type: 'booking',
      title: 'New Booking Received',
      message: 'John Doe has booked Green Field for today 6:00 PM - 7:00 PM',
      read: false,
      createdAt: new Date().toISOString(),
      priority: 'high',
      relatedId: 'booking123'
    },
    {
      _id: '2',
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of ₹500 received for booking #BK001',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      priority: 'medium',
      relatedId: 'payment456'
    }
  ];

  res.status(200).json({
    status: 'success',
    notifications
  });
});

export const markNotificationAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read'
  });
});

export const markAllNotificationsAsRead = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

export const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  res.status(200).json({
    status: 'success',
    message: 'Notification deleted successfully'
  });
});

// -------------------- DATA MANAGEMENT --------------------

export const exportData = catchAsync(async (req, res) => {
  ensureModels();
  
  const adminId = req.user.id;
  
  // Fetch all admin's data
  const turfs = await Turf.find({ owner: adminId });
  
  const bookings = await Booking.aggregate([
    {
      $lookup: {
        from: 'turfs',
        localField: 'turf',
        foreignField: '_id',
        as: 'turfData'
      }
    },
    { 
      $match: { 
        'turfData.owner': new mongoose.Types.ObjectId(adminId) 
      } 
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData'
      }
    },
    {
      $addFields: {
        turf: { $arrayElemAt: ['$turfData', 0] },
        user: { $arrayElemAt: ['$userData', 0] }
      }
    }
  ]);
  
  const exportData = {
    admin: {
      id: adminId,
      exportDate: new Date().toISOString()
    },
    turfs: turfs,
    bookings: bookings.map(booking => ({
      id: booking._id,
      user: booking.user,
      turf: booking.turf,
      date: booking.date,
      timeSlot: booking.timeSlot,
      amount: booking.amount,
      status: booking.status,
      createdAt: booking.createdAt
    })),
    statistics: {
      totalTurfs: turfs.length,
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0)
    }
  };
  
  res.status(200).json({
    status: 'success',
    data: exportData
  });
});

export const deleteAccount = catchAsync(async (req, res, next) => {
  ensureModels();
  
  const adminId = req.user.id;
  
  // Delete all related data - first get turf IDs, then delete related bookings
  const turfIds = await Turf.find({ owner: adminId }).distinct('_id');
  
  // Delete bookings related to admin's turfs
  await Booking.deleteMany({ turf: { $in: turfIds } });
  
  // Delete turfs
  await Turf.deleteMany({ owner: adminId });
  
  // Delete admin account
  await Admin.findByIdAndDelete(adminId);
  
  res.status(200).json({
    status: 'success',
    message: 'Account and all associated data deleted successfully'
  });
});

// -------------------- SUPPORT & HELP --------------------

export const getSupportTickets = catchAsync(async (req, res) => {
  const adminId = req.user.id;
  
  // Mock support tickets data - replace with actual database query
  const tickets = [
    {
      id: 'TKT001',
      userId: adminId,
      subject: 'Payment not received for booking #BK123',
      category: 'billing',
      priority: 'high',
      status: 'open',
      message: 'I completed a booking yesterday but haven\'t received payment yet. The customer paid through the app.',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      lastUpdate: new Date(Date.now() - 86400000).toISOString(),
      responses: []
    },
    {
      id: 'TKT002',
      userId: adminId,
      subject: 'Unable to upload turf images',
      category: 'technical',
      priority: 'medium',
      status: 'resolved',
      message: 'Getting error when trying to upload images for my new turf. The upload fails every time.',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      lastUpdate: new Date(Date.now() - 86400000).toISOString(),
      responses: [
        {
          from: 'support',
          message: 'Please ensure images are under 5MB and in JPG/PNG format. Try clearing browser cache.',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    }
  ];
  
  res.status(200).json({
    status: 'success',
    tickets
  });
});

export const createSupportTicket = catchAsync(async (req, res) => {
  const adminId = req.user.id;
  const { subject, category, priority, message } = req.body;
  
  // Validate input
  if (!subject || !message || !category || !priority) {
    return res.status(400).json({
      status: 'error',
      message: 'Subject, message, category, and priority are required'
    });
  }
  
  // Generate ticket ID
  const ticketId = `TKT${Date.now().toString().slice(-6)}`;
  
  // In a real app, save to database
  const ticket = {
    id: ticketId,
    userId: adminId,
    subject,
    category,
    priority,
    message,
    status: 'open',
    createdAt: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    responses: []
  };
  
  res.status(201).json({
    status: 'success',
    message: 'Support ticket created successfully',
    ticket
  });
});

export const getSupportTicketById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  
  // Mock ticket data - replace with database query
  const ticket = {
    id: id,
    userId: adminId,
    subject: 'Sample ticket subject',
    category: 'general',
    priority: 'medium',
    status: 'open',
    message: 'This is a sample support ticket message.',
    createdAt: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    responses: []
  };
  
  res.status(200).json({
    status: 'success',
    ticket
  });
});

export const updateSupportTicket = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      status: 'error',
      message: 'Message is required'
    });
  }
  
  // In a real app, add response to ticket in database
  res.status(200).json({
    status: 'success',
    message: 'Response added to ticket successfully'
  });
});
