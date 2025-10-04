import mongoose from 'mongoose';
import Turf from '../models/Turf.js';

/**
 * Database Migration Script
 * Fixes geospatial indexing issues by moving 'location' data to 'address' field
 */

export const fixGeoLocationIssues = async () => {
  try {
    console.log('🔄 Starting geo location fix migration...');
    
    // Remove any existing geospatial indexes on location field
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('turfs');
      
      // Get all indexes
      const indexes = await collection.listIndexes().toArray();
      console.log('📋 Current indexes:', indexes.map(i => i.name));
      
      // Drop any location-based geo indexes
      for (const index of indexes) {
        if (index.name.includes('location') && index.name !== '_id_') {
          console.log('🗑️ Dropping geo index:', index.name);
          try {
            await collection.dropIndex(index.name);
          } catch (dropError) {
            console.log('⚠️ Could not drop index:', index.name, dropError.message);
          }
        }
      }
      
    } catch (indexError) {
      console.log('⚠️ Index cleanup error:', indexError.message);
    }
    
    // Find turfs with location but no address
    const turfsToMigrate = await Turf.find({
      $or: [
        { location: { $exists: true, $ne: null }, address: { $exists: false } },
        { location: { $exists: true, $ne: null }, address: null },
        { location: { $exists: true, $ne: null }, address: '' }
      ]
    });
    
    console.log(`📊 Found ${turfsToMigrate.length} turfs to migrate`);
    
    if (turfsToMigrate.length > 0) {
      // Update turfs using direct MongoDB operations to avoid schema conflicts
      const db = mongoose.connection.db;
      const collection = db.collection('turfs');
      
      for (const turf of turfsToMigrate) {
        try {
          const updateResult = await collection.updateOne(
            { _id: turf._id },
            { 
              $set: { 
                address: turf.location || turf.address || 'Location not specified'
              }
            }
          );
          
          if (updateResult.modifiedCount > 0) {
            console.log(`✅ Migrated turf: ${turf.name} (${turf._id})`);
          }
        } catch (updateError) {
          console.error(`❌ Failed to migrate turf ${turf._id}:`, updateError.message);
        }
      }
    }
    
    // Ensure all turfs have an address field
    const turfsWithoutAddress = await Turf.countDocuments({
      $or: [
        { address: { $exists: false } },
        { address: null },
        { address: '' }
      ]
    });
    
    if (turfsWithoutAddress > 0) {
      console.log(`🔧 Fixing ${turfsWithoutAddress} turfs without address...`);
      
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
        { 
          $set: { 
            address: 'Address not specified'
          }
        }
      );
    }
    
    console.log('✅ Geo location migration completed successfully');
    
    // Verify migration
    const totalTurfs = await Turf.countDocuments();
    const turfsWithAddress = await Turf.countDocuments({ address: { $exists: true, $ne: '' } });
    
    console.log(`📊 Migration verification: ${turfsWithAddress}/${totalTurfs} turfs have address field`);
    
    return {
      success: true,
      migrated: turfsToMigrate.length,
      total: totalTurfs,
      verified: turfsWithAddress
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default fixGeoLocationIssues;