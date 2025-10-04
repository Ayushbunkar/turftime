/**
 * Database cleanup script to fix geospatial indexing issues
 * Run this script to remove problematic location fields and indexes
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupGeospatialIssues() {
  try {
    console.log('🔄 Starting geospatial cleanup script...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/turrfown');
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('turfs');
    
    // 1. List current indexes
    console.log('📊 Current indexes:');
    const indexes = await collection.listIndexes().toArray();
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key || {})}`);
    });
    
    // 2. Drop problematic geospatial indexes
    console.log('\n🗑️ Dropping problematic indexes...');
    let droppedCount = 0;
    
    for (const index of indexes) {
      const shouldDrop = 
        index.name.includes('location') || 
        (index.key && index.key.location) ||
        (index['2dsphere'] && index['2dsphere'] === 1) ||
        (index.key && index.key.location === '2dsphere');
        
      if (shouldDrop && index.name !== '_id_') {
        try {
          await collection.dropIndex(index.name);
          console.log(`  ✅ Dropped: ${index.name}`);
          droppedCount++;
        } catch (error) {
          console.log(`  ⚠️ Failed to drop ${index.name}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n📊 Dropped ${droppedCount} problematic indexes`);
    
    // 3. Check documents with location field
    const docsWithLocation = await collection.countDocuments({ 
      location: { $exists: true } 
    });
    console.log(`\n📊 Documents with location field: ${docsWithLocation}`);
    
    if (docsWithLocation > 0) {
      console.log('🔧 Cleaning up location fields...');
      
      // First, ensure all docs have address field
      const result1 = await collection.updateMany(
        { 
          location: { $exists: true },
          $or: [
            { address: { $exists: false } },
            { address: null },
            { address: '' }
          ]
        },
        [{
          $set: {
            address: {
              $cond: {
                if: { $and: [{ $ne: ['$location', null] }, { $ne: ['$location', ''] }] },
                then: '$location',
                else: 'Address not specified'
              }
            }
          }
        }]
      );
      console.log(`  ✅ Ensured address field for ${result1.modifiedCount} documents`);
      
      // Then remove location field
      const result2 = await collection.updateMany(
        { location: { $exists: true } },
        { 
          $unset: { location: "" },
          $set: { updatedAt: new Date() }
        }
      );
      console.log(`  ✅ Removed location field from ${result2.modifiedCount} documents`);
    }
    
    // 4. Verify cleanup
    const remainingWithLocation = await collection.countDocuments({ 
      location: { $exists: true } 
    });
    const totalDocs = await collection.countDocuments({});
    const docsWithAddress = await collection.countDocuments({ 
      address: { $exists: true, $ne: '' } 
    });
    
    console.log('\n📊 Cleanup Results:');
    console.log(`  - Total documents: ${totalDocs}`);
    console.log(`  - Documents with location field: ${remainingWithLocation}`);
    console.log(`  - Documents with address field: ${docsWithAddress}`);
    
    // 5. List final indexes
    console.log('\n📊 Final indexes:');
    const finalIndexes = await collection.listIndexes().toArray();
    finalIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key || {})}`);
    });
    
    if (remainingWithLocation === 0) {
      console.log('\n✅ Geospatial cleanup completed successfully!');
      console.log('   - All location fields removed');
      console.log('   - All geospatial indexes dropped');
      console.log('   - Address fields preserved/created');
    } else {
      console.log('\n⚠️ Some documents still have location field');
      console.log('   You may need to run the cleanup again');
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
  }
}

// Run the cleanup
cleanupGeospatialIssues();