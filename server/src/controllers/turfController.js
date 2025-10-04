import Turf from "../models/Turf.js";

export async function getAllTurfs(req, res) {
  try {
    console.log("📋 Fetching turfs - User:", req.user?.role || "Public", "Email:", req.user?.email || "N/A");
    
    // Allow access to all authenticated users and public users
    // No role restrictions - all users can view turfs
    const query = {};
    
    // Show active turfs by default
    // Only show inactive turfs to superadmin
    if (!req.user || req.user.role !== 'superadmin') {
      query.isActive = true;
    }
    
    console.log("🔍 Query being used:", JSON.stringify(query));
    
    // First check total count without filters
    const totalCount = await Turf.countDocuments({});
    const activeCount = await Turf.countDocuments({ isActive: true });
    const inactiveCount = await Turf.countDocuments({ isActive: false });
    const noActiveFieldCount = await Turf.countDocuments({ isActive: { $exists: false } });
    
    console.log(`🔢 Database stats: Total=${totalCount}, Active=${activeCount}, Inactive=${inactiveCount}, NoActiveField=${noActiveFieldCount}`);
    
    const turfs = await Turf.find(query)
      .populate('owner', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform data for frontend
    const transformedTurfs = turfs.map(turf => ({
      ...turf,
      id: turf._id.toString(),
      address: turf.location?.address || turf.address || 'Address not available',
      latitude: turf.location?.coordinates?.[1] || turf.latitude,
      longitude: turf.location?.coordinates?.[0] || turf.longitude,
      amenities: turf.amenities || [],
      timeSlots: turf.timeSlots || [],
      groupDiscounts: turf.groupDiscounts || [],
      price: turf.pricing?.hourlyRate || turf.price || 0,
      rating: turf.rating || 0,
      reviews: turf.reviewCount || 0,
      capacity: turf.capacity || 0,
      surface: turf.surface || 'Grass',
      weatherDependent: turf.weatherDependent !== false,
      established: turf.established || new Date().getFullYear(),
      images: turf.images || [],
      weather: turf.weather || null,
      loyaltyPoints: turf.loyaltyPoints || 0
    }));
    
    console.log(`✅ Successfully returned ${transformedTurfs.length} turfs to ${req.user?.role || 'public'} user`);
    
    res.status(200).json({
      status: 'success',
      results: transformedTurfs.length,
      data: transformedTurfs,
      message: `Found ${transformedTurfs.length} turfs`
    });
  } catch (err) {
    console.error('❌ Error fetching turfs:', err);
    res.status(500).json({ 
      status: 'error',
      message: "Failed to fetch turfs",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

// Create a separate public endpoint that doesn't require authentication
export async function getPublicTurfs(req, res) {
  try {
    console.log("📋 Public turfs endpoint accessed");
    
    const turfs = await Turf.find({ isActive: true })
      .populate('owner', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();
    
    const transformedTurfs = turfs.map(turf => ({
      ...turf,
      id: turf._id.toString(),
      address: turf.location?.address || turf.address || 'Address not available',
      latitude: turf.location?.coordinates?.[1] || turf.latitude,
      longitude: turf.location?.coordinates?.[0] || turf.longitude,
      amenities: turf.amenities || [],
      timeSlots: turf.timeSlots || [],
      groupDiscounts: turf.groupDiscounts || [],
      price: turf.pricing?.hourlyRate || turf.price || 0,
      rating: turf.rating || 0,
      reviews: turf.reviewCount || 0,
      capacity: turf.capacity || 0,
      surface: turf.surface || 'Grass',
      weatherDependent: turf.weatherDependent !== false,
      established: turf.established || new Date().getFullYear(),
      images: turf.images || [],
      weather: turf.weather || null,
      loyaltyPoints: turf.loyaltyPoints || 0
    }));
    
    console.log(`✅ Public endpoint returned ${transformedTurfs.length} turfs`);
    
    res.status(200).json({
      status: 'success',
      results: transformedTurfs.length,
      data: transformedTurfs,
      public: true
    });
  } catch (err) {
    console.error('❌ Error fetching public turfs:', err);
    res.status(500).json({ 
      status: 'error',
      message: "Failed to fetch turfs",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

// ...existing code...
