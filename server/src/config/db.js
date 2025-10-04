// server/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log('✅ MongoDB connected successfully');
    
    // Clean up any problematic geospatial indexes
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      
      for (const collection of collections) {
        if (collection.name === 'turfs') {
          const indexes = await db.collection('turfs').indexes();
          
          // Drop any geospatial indexes on location field
          for (const index of indexes) {
            if (index.key && index.key.location && 
                (index.key.location === '2dsphere' || index.key.location === '2d')) {
              console.log('🧹 Dropping geospatial index on location field');
              await db.collection('turfs').dropIndex(index.name);
            }
          }
        }
      }
    } catch (indexError) {
      console.log('ℹ️ Index cleanup completed (some indexes may not exist)');
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('💡 Please make sure MongoDB is running:');
    console.log('   - Windows: Start MongoDB service or run `mongod`');
    console.log('   - Or use MongoDB Atlas cloud database');
    console.log('⚠️  Server will continue without database (some features may not work)');
    
    // Don't exit - let server continue for static functionality
    return false;
  }
  
  return true;
};

export default connectDB;
