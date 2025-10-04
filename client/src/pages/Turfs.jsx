import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Star, 
  Users, 
  IndianRupee, 
  Clock, 
  Eye, 
  Calendar,
  Filter,
  Search,
  Grid,
  List
} from "lucide-react";
import axios from "axios";
import api from "../lib/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import QuickBookingModal from "../components/Booking/QuickBookingModal";

export default function Turfs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [filteredTurfs, setFilteredTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    sportType: '',
    priceRange: '',
    location: '',
    rating: '',
    sortBy: 'name'
  });
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTurf, setSelectedTurf] = useState(null);

  // Load turfs from API
  const loadTurfs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Loading turfs from API...");
      
      const response = await api.get("/turfs");
      console.log("📊 API response:", response.data);
      
      if (response.data?.status === 'success') {
        const turfsData = response.data.data || [];
        setTurfs(turfsData);
        setFilteredTurfs(turfsData);
        
        if (turfsData.length > 0) {
          toast.success(`✅ Loaded ${turfsData.length} turfs successfully!`);
        } else {
          toast("� No turfs found. Create some in TurfAdmin dashboard!");
        }
      }
    } catch (error) {
      console.error("❌ Error loading turfs:", error);
      setError(error.message);
      
      if (error.code === 'ERR_NETWORK') {
        toast.error("🔌 Server not running. Please check backend server.");
      } else {
        toast.error("Failed to load turfs: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...turfs];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(turf => 
        turf.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        turf.location?.toLowerCase().includes(filters.search.toLowerCase()) ||
        turf.address?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Sport type filter
    if (filters.sportType) {
      filtered = filtered.filter(turf => 
        turf.sportType?.toLowerCase() === filters.sportType.toLowerCase()
      );
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(turf => {
        const price = turf.pricePerHour || turf.price || 0;
        return price >= min && (max ? price <= max : true);
      });
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(turf => 
        (turf.location || turf.address || '')
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    // Rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(turf => 
        (turf.rating || 0) >= minRating
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return (a.pricePerHour || a.price || 0) - (b.pricePerHour || b.price || 0);
        case 'price-high':
          return (b.pricePerHour || b.price || 0) - (a.pricePerHour || a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    setFilteredTurfs(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle view details
  const handleViewDetails = (turf) => {
    navigate(`/turfs/${turf._id}`);
  };

  // Handle quick booking
  const handleQuickBook = (turf) => {
    if (!user) {
      toast.error('Please login to book a turf');
      navigate('/login');
      return;
    }
    
    setSelectedTurf(turf);
    setShowBookingModal(true);
  };

  // Handle direct booking
  const handleDirectBook = (turf) => {
    if (!user) {
      toast.error('Please login to book a turf');
      navigate('/login');
      return;
    }
    
    navigate(`/turfs/${turf._id}`, { state: { activeTab: 'booking' } });
  };

  // Load turfs on component mount
  useEffect(() => {
    loadTurfs();
  }, []);

  // Apply filters when filters or turfs change
  useEffect(() => {
    applyFilters();
  }, [filters, turfs]);

  // Get unique values for filter options
  const getUniqueValues = (key) => {
    const values = turfs.map(turf => turf[key]).filter(Boolean);
    return [...new Set(values)];
  };

  const sportTypes = getUniqueValues('sportType');
  const locations = [
    ...new Set(
      turfs.map(turf => turf.location || turf.address).filter(Boolean)
    )
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading turfs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Perfect Turf</h1>
          <p className="text-gray-600 text-lg">Book the best sports facilities in your area</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by turf name or location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <button
              onClick={loadTurfs}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Sport Type Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filters.sportType}
              onChange={(e) => handleFilterChange('sportType', e.target.value)}
            >
              <option value="">All Sports</option>
              {sportTypes.map(sport => (
                <option key={sport} value={sport} className="capitalize">{sport}</option>
              ))}
            </select>

            {/* Price Range Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            >
              <option value="">Any Price</option>
              <option value="0-500">₹0 - ₹500</option>
              <option value="500-1000">₹500 - ₹1000</option>
              <option value="1000-1500">₹1000 - ₹1500</option>
              <option value="1500">₹1500+</option>
            </select>

            {/* Location Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>

            {/* Sort By */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Results Info and View Toggle */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredTurfs.length} of {turfs.length} turfs
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* No Results */}
        {!loading && filteredTurfs.length === 0 && turfs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 bg-white rounded-lg shadow-md"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No turfs match your filters</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
            <button
              onClick={() => setFilters({
                search: '',
                sportType: '',
                priceRange: '',
                location: '',
                rating: '',
                sortBy: 'name'
              })}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}

        {/* No Turfs at all */}
        {!loading && turfs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 bg-white rounded-lg shadow-md"
          >
            <div className="text-6xl mb-4">🏟️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Turfs Available</h3>
            <p className="text-gray-600 mb-4">
              Be the first to add turfs to the platform!
            </p>
          </motion.div>
        )}

        {/* Turfs Grid/List */}
        {!loading && filteredTurfs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }
          >
            {filteredTurfs.map((turf, index) => (
              <motion.div
                key={turf._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`
                  bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300
                  ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}
                `}
              >
                {/* Image */}
                <div className={`relative ${viewMode === 'list' ? 'md:w-1/3 h-48 md:h-auto' : 'h-48'}`}>
                  {turf.images && turf.images.length > 0 ? (
                    <img
                      src={turf.images[0]}
                      alt={turf.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Turf+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
                      <span className="text-white text-4xl">🏟️</span>
                    </div>
                  )}
                  
                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center">
                    <Star className="text-yellow-400 mr-1" size={14} />
                    <span className="text-sm font-medium">{turf.rating || '4.0'}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className={`p-6 ${viewMode === 'list' ? 'md:w-2/3 flex flex-col justify-between' : ''}`}>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {turf.name || `Turf ${index + 1}`}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="mr-2" size={16} />
                      <span className="text-sm">
                        {turf.location || turf.address || 'Address not available'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <IndianRupee className="text-green-600 mr-1" size={18} />
                        <span className="text-xl font-bold text-green-600">
                          {turf.pricePerHour || turf.price || 500}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">/hour</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="mr-1" size={14} />
                        <span>{turf.capacity || 22} players</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full capitalize">
                        {turf.sportType || 'Football'}
                      </span>
                    </div>
                    
                    {/* Amenities */}
                    {turf.amenities && turf.amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {turf.amenities.slice(0, 3).map((amenity, idx) => (
                            <span 
                              key={idx} 
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                          {turf.amenities.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{turf.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDetails(turf)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    <button
                      onClick={() => handleDirectBook(turf)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Calendar size={16} />
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Quick Booking Modal */}
        {showBookingModal && selectedTurf && (
          <QuickBookingModal
            turf={selectedTurf}
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedTurf(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
