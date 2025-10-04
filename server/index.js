// =========================
// Import Core Packages
// =========================
import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

import cors from 'cors';
import cookieParser from 'cookie-parser';
import Razorpay from "razorpay";
import connectDB from './src/config/db.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const app = express();

// =========================
// Middleware
// =========================
app.use(cors({
  origin: 'http://localhost:5173', // change for production
  credentials: true, // allow cookies
}));

// Increase body parser limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Make uploads folder public
app.use('/uploads', express.static('uploads'));

// =========================
// Load Models
// =========================
import './src/models/userModel.js';
import './src/models/Turf.js';
import './src/models/Booking.js';
import './src/models/Admin.js';
import './src/models/TimeSlot.js';
import './src/models/Booking.js';
import './src/models/BookingAnalytics.js';

// =========================
// Load Routes
// =========================
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import superAdminRoutes from './src/routes/superAdminRoutes.js';
import turfadminRoutes from './src/routes/turfadminRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import turfRoutes from './src/routes/turfRoutes.js';
import mapsRoutes from './src/routes/mapsRoutes.js';
import slotRoutes from './src/routes/slotRoutes.js';

// =========================
// Routes
// =========================
app.use('/api/auth', authRoutes); // ✅ handles register & login via controller
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/turfadmin', turfadminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/slots', slotRoutes);

// =========================
// Test Routes (No DB Required)
// =========================
app.get('/api/test/turfadmin', (req, res) => {
  console.log('🧪 Test turfadmin endpoint called');
  res.json({
    status: 'success',
    message: 'Mock turfadmin controller is working!',
    timestamp: new Date().toISOString(),
    mockData: true
  });
});

// Test POST endpoint for turf creation debugging
app.post('/api/test/create-turf', (req, res) => {
  console.log('🧪 Test create turf endpoint called');
  console.log('📝 Request body:', req.body);
  console.log('📁 Files:', req.files);
  console.log('🔑 Headers:', req.headers);
  
  res.json({
    status: 'success',
    message: 'Test turf creation endpoint working!',
    receivedData: {
      body: req.body,
      files: req.files ? req.files.length : 0,
      headers: {
        authorization: req.headers.authorization ? 'Present' : 'Missing',
        contentType: req.headers['content-type']
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Test geospatial fix endpoint
app.post('/api/test/geo-fix', async (req, res) => {
  try {
    console.log('🧪 Testing geo fix with safe data structure');
    
    const Turf = mongoose.model('Turf');
    const testTurfData = {
      name: 'Test Turf Safe',
      address: 'Test Address 123', // Using address instead of location
      description: 'Test description for geo fix',
      pricePerHour: 100,
      sportType: 'football',
      owner: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // dummy ObjectId
      images: [],
      amenities: ['Test Amenity'],
      isActive: true,
      surface: 'Artificial Grass',
      capacity: 22,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Try direct MongoDB insertion
    const db = mongoose.connection.db;
    const collection = db.collection('turfs');
    
    const insertResult = await collection.insertOne(testTurfData);
    
    // Clean up test data
    await collection.deleteOne({ _id: insertResult.insertedId });
    
    res.json({
      status: 'success',
      message: 'Geo fix test passed! Safe to create turfs now.',
      testId: insertResult.insertedId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Geo fix test failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Geo fix test failed',
      error: error.message
    });
  }
});

// Debug endpoint to test analytics without auth
app.get('/api/debug/analytics', async (req, res) => {
  try {
    console.log('🔍 Debug analytics endpoint called');
    
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    console.log('📊 Database status:', dbStatus);
    
    if (dbStatus === 'disconnected') {
      return res.json({
        status: 'error',
        message: 'Database not connected',
        dbStatus
      });
    }
    
    // Check if models exist
    const models = mongoose.models || {};
    const modelStatus = {
      User: !!models.User,
      Turf: !!models.Turf,
      Booking: !!models.Booking,
      Admin: !!models.Admin
    };
    console.log('📋 Model status:', modelStatus);
    
    // Try to get a simple count from each collection
    const Turf = mongoose.model('Turf');
    const Booking = mongoose.model('Booking');
    
    const turfCount = await Turf.countDocuments({});
    const bookingCount = await Booking.countDocuments({});
    
    console.log('📈 Basic counts:', { turfCount, bookingCount });
    
    res.json({
      status: 'success',
      message: 'Debug analytics endpoint working',
      dbStatus,
      modelStatus,
      counts: { turfCount, bookingCount },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Debug analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// =========================
// Backup Public Turfs Route (Completely isolated)
// =========================
app.get('/api/public/turfs', async (req, res) => {
  try {
    console.log('📋 Backup public turfs endpoint accessed - completely isolated');
    
    const Turf = mongoose.model('Turf');
    
    // Check database stats
    const totalCount = await Turf.countDocuments({});
    const activeCount = await Turf.countDocuments({ isActive: true });
    const inactiveCount = await Turf.countDocuments({ isActive: false });
    const noActiveFieldCount = await Turf.countDocuments({ isActive: { $exists: false } });
    
    console.log(`🔢 BACKUP Database stats: Total=${totalCount}, Active=${activeCount}, Inactive=${inactiveCount}, NoActiveField=${noActiveFieldCount}`);
    
    const turfs = await Turf.find({ isActive: true })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${turfs.length} active turfs via backup endpoint`);
    
    res.status(200).json({
      status: 'success',
      results: turfs.length,
      data: turfs,
      source: 'backup-public-endpoint'
    });
  } catch (err) {
    console.error('❌ Error in backup turfs endpoint:', err);
    res.status(500).json({ 
      status: 'error',
      message: "Failed to fetch turfs from backup endpoint",
      error: err.message 
    });
  }
});

// Debug endpoint to check database contents
app.get('/api/debug/turfs', async (req, res) => {
  try {
    console.log('🔍 Debug: Checking all turfs in database...');
    
    const Turf = mongoose.model('Turf');
    
    // Get all turfs without any filters
    const allTurfs = await Turf.find({});
    console.log(`🔍 Total turfs in database: ${allTurfs.length}`);
    
    // Get active turfs
    const activeTurfs = await Turf.find({ isActive: true });
    console.log(`🔍 Active turfs in database: ${activeTurfs.length}`);
    
    // Get raw collection data
    const db = mongoose.connection.db;
    const rawTurfs = await db.collection('turfs').find({}).toArray();
    console.log(`🔍 Raw turfs in collection: ${rawTurfs.length}`);
    
    res.json({
      status: 'success',
      mongooseAllTurfs: allTurfs.length,
      mongooseActiveTurfs: activeTurfs.length,
      rawCollectionTurfs: rawTurfs.length,
      allTurfsData: allTurfs,
      rawTurfsData: rawTurfs
    });
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// DEBUG ENDPOINT - Check what's actually in the database
// =========================
app.get('/api/debug/turfs', async (req, res) => {
  try {
    console.log('🔍 DEBUG: Checking all turfs in database...');
    
    const Turf = mongoose.model('Turf');
    const allTurfs = await Turf.find({}).lean();
    const activeTurfs = await Turf.find({ isActive: true }).lean();
    const inactiveTurfs = await Turf.find({ isActive: false }).lean();
    const missingActive = await Turf.find({ isActive: { $exists: false } }).lean();
    
    console.log(`🔍 Total turfs: ${allTurfs.length}, Active: ${activeTurfs.length}, Inactive: ${inactiveTurfs.length}, No isActive field: ${missingActive.length}`);
    
    res.json({
      status: 'debug',
      totalCount: allTurfs.length,
      activeCount: activeTurfs.length,
      inactiveCount: inactiveTurfs.length,
      missingActiveCount: missingActive.length,
      allTurfs: allTurfs.map(t => ({
        id: t._id,
        name: t.name,
        isActive: t.isActive,
        owner: t.owner,
        createdAt: t.createdAt
      })),
      activeTurfs: activeTurfs.slice(0, 5), // First 5 active turfs
      sampleRawTurf: allTurfs[0] || null
    });
  } catch (err) {
    console.error('❌ Debug endpoint error:', err);
    res.status(500).json({ 
      status: 'error',
      message: err.message 
    });
  }
});

app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is accessible',
    cors: 'enabled',
    endpoints: [
      'GET /api/health - Server health check',
      'GET /api/debug/turfs - Debug database contents',
      'POST /api/auth/register - User registration',
      'POST /api/auth/login - User login',
      'GET /api/turfadmin/turfs - Get turfs (requires auth)',
      'POST /api/turfadmin/turfs - Create turf (requires auth)'
    ]
  });
});

// =========================
// 404 Handler
// =========================
app.use((req, res, next) => {
  res.status(404).json({ status: 'fail', message: 'Route not found' });
});

// =========================
// Global Error Handler
// =========================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// =========================
// Connect to MongoDB & Start Server
// =========================
const PORT = process.env.PORT || 4500;

// Enhanced error handling for server startup
async function startServer() {
  try {
    console.log('🚀 Initializing TurrfOwn Server...');
    
    // Try database connection (non-blocking)
    let dbConnected = false;
    try {
      dbConnected = await connectDB();
    } catch (dbError) {
      console.log('⚠️  Database connection failed, continuing without database');
      console.log('💡 Error:', dbError.message);
    }
    
    if (dbConnected) {
      console.log('🎉 Server starting with full database functionality');
      
      // Run database migrations
      try {
        console.log('🔄 Running database migrations...');
        const Turf = mongoose.model('Turf');
        
        // Migration 1: Fix missing isActive fields
        const turfsWithoutIsActive = await Turf.countDocuments({ isActive: { $exists: false } });
        console.log(`📊 Found ${turfsWithoutIsActive} turfs without isActive field`);
        
        if (turfsWithoutIsActive > 0) {
          console.log('🔧 Fixing turfs without isActive field...');
          const updateResult = await Turf.updateMany(
            { isActive: { $exists: false } },
            { $set: { isActive: true } }
          );
          console.log(`✅ Updated ${updateResult.modifiedCount} turfs to have isActive: true`);
        }
        
        // Migration 2: Fix geospatial location issues
        console.log('🔄 Running comprehensive geospatial fix...');
        
        try {
          const db = mongoose.connection.db;
          const collection = db.collection('turfs');
          
          // 1. Drop ALL problematic indexes
          console.log('🗑️ Cleaning up all geospatial indexes...');
          try {
            const indexes = await collection.listIndexes().toArray();
            console.log('📊 Current indexes:', indexes.map(i => i.name));
            
            for (const index of indexes) {
              if (index.name.includes('location') || 
                  (index.key && index.key.location) ||
                  (index['2dsphere'] && index['2dsphere'] === 1)) {
                console.log('🗑️ Dropping geo index:', index.name);
                try {
                  await collection.dropIndex(index.name);
                  console.log('✅ Dropped index:', index.name);
                } catch (dropError) {
                  console.log('⚠️ Index already dropped or error:', index.name, dropError.message);
                }
              }
            }
          } catch (indexListError) {
            console.log('⚠️ Index listing completed with warnings');
          }
          
          // 2. Remove location field from all documents
          console.log('🔧 Removing location field from all turf documents...');
          const updateLocationResult = await collection.updateMany(
            { location: { $exists: true } },
            { 
              $unset: { location: "" },
              $set: { 
                updatedAt: new Date(),
                // Ensure address exists if location was being used
                address: { 
                  $cond: { 
                    if: { $or: [{ $eq: ["$address", null] }, { $eq: ["$address", ""] }] },
                    then: { $ifNull: ["$location", "Address not specified"] },
                    else: "$address"
                  }
                }
              }
            }
          );
          console.log(`✅ Updated ${updateLocationResult.modifiedCount} documents to remove location field`);
          
          // 3. Ensure no geospatial validation
          console.log('🔒 Ensuring clean schema state...');
          
          // 4. Check final state
          const remainingWithLocation = await collection.countDocuments({ location: { $exists: true } });
          console.log(`📊 Documents with location field remaining: ${remainingWithLocation}`);
          
          if (remainingWithLocation === 0) {
            console.log('✅ Geospatial cleanup completed successfully');
          } else {
            console.log('⚠️ Some documents still have location field, will continue cleanup');
          }
          
        } catch (geoError) {
          console.log('⚠️ Geospatial cleanup error:', geoError.message);
        }
        
        // Ensure all turfs have address field
        const turfsWithoutAddress = await Turf.countDocuments({
          $or: [
            { address: { $exists: false } },
            { address: null },
            { address: '' }
          ]
        });
        
        if (turfsWithoutAddress > 0) {
          console.log(`🔧 Fixing ${turfsWithoutAddress} turfs without address field...`);
          
          const db = mongoose.connection.db;
          const collection = db.collection('turfs');
          
          await collection.updateMany(
            {
              $or: [
                { address: { $exists: false } },
                { address: null },
                { address: '' }
              ]
            },
            [
              {
                $set: {
                  address: {
                    $cond: {
                      if: { $and: [{ $ne: ['$location', null] }, { $ne: ['$location', ''] }] },
                      then: '$location',
                      else: 'Address not specified'
                    }
                  }
                }
              }
            ]
          );
          console.log(`✅ Fixed address fields for ${turfsWithoutAddress} turfs`);
        }
        
        // Log current statistics
        const totalTurfs = await Turf.countDocuments({});
        const activeTurfs = await Turf.countDocuments({ isActive: true });
        const turfsWithAddress = await Turf.countDocuments({ address: { $exists: true, $ne: '' } });
        
        console.log(`📈 Database stats: Total=${totalTurfs}, Active=${activeTurfs}, WithAddress=${turfsWithAddress}`);
        
      } catch (migrationError) {
        console.log('⚠️ Migration error:', migrationError.message);
      }
    } else {
      console.log('⚠️  Server starting in limited mode (database not available)');
    }
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      
      if (!dbConnected) {
        console.log('\n💡 To enable database features:');
        console.log('   1. Start MongoDB: net start MongoDB (as admin)');
        console.log('   2. Or install MongoDB from: https://www.mongodb.com/try/download/community');
        console.log('   3. Then restart this server');
      }
      
      console.log('\n✅ Server startup completed successfully!');
    });
    
    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log(`💡 Try changing the PORT in .env file or stop other services`);
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Critical error during server initialization:', error.message);
    console.log('🔧 Troubleshooting tips:');
    console.log('   - Check if all dependencies are installed: npm install');
    console.log('   - Verify .env file exists with required variables');
    console.log('   - Ensure no syntax errors in code files');
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
