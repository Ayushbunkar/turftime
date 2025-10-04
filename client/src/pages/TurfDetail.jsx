import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Star, Users, Calendar, Clock, Wifi, Car, Droplets, Coffee } from "lucide-react";
import api from "../lib/api";
import SlotBookingSystem from "../components/Booking/SlotBookingSystem";
import TurfLocationMap from "../components/Maps/TurfLocationMap";
import { toast } from "react-hot-toast";

const TurfDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || 'overview'
  );

  useEffect(() => {
    if (id) {
      fetchTurfDetails();
    }
  }, [id]);

  const fetchTurfDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/turfs/${id}`);
      setTurf(response.data.data);
    } catch (error) {
      console.error('Error fetching turf details:', error);
      toast.error('Failed to load turf details');
      navigate('/turfs'); // Redirect to turfs list if turf not found
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      'wifi': <Wifi size={16} />,
      'parking': <Car size={16} />,
      'shower': <Droplets size={16} />,
      'cafeteria': <Coffee size={16} />,
      'changing room': <Users size={16} />,
    };
    return icons[amenity.toLowerCase()] || <div className="w-4 h-4 bg-green-600 rounded-full"></div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Turf not found</h2>
          <button
            onClick={() => navigate('/turfs')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Turfs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="space-y-4"
            >
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <img
                  src={turf.images?.[0] || '/placeholder-turf.jpg'}
                  alt={turf.name}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-turf.jpg";
                  }}
                />
                {turf.images?.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    +{turf.images.length - 1} more
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {turf.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {turf.images.slice(1, 5).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${turf.name} ${index + 2}`}
                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-turf.jpg";
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Turf Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{turf.name}</h1>
                <div className="flex items-center space-x-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-1" />
                    <span>{turf.location}</span>
                  </div>
                  {turf.rating > 0 && (
                    <div className="flex items-center">
                      <Star size={18} className="mr-1 text-yellow-400" />
                      <span>{turf.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">{turf.description}</p>
              </div>

              {/* Key Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <Clock className="mr-2 text-green-600" size={20} />
                    <span className="font-medium text-green-800">Price per Hour</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">₹{turf.pricePerHour}</span>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <Users className="mr-2 text-blue-600" size={20} />
                    <span className="font-medium text-blue-800">Sport Type</span>
                  </div>
                  <span className="text-lg font-medium text-blue-600 capitalize">{turf.sportType}</span>
                </div>
              </div>

              {/* Amenities */}
              {turf.amenities?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {turf.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-100 px-3 py-2 rounded-full text-sm text-gray-700"
                      >
                        {getAmenityIcon(amenity)}
                        <span className="ml-2 capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{turf.capacity || 22}</div>
                  <div className="text-sm text-gray-600">Max Players</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{turf.size || 'Full'}</div>
                  <div className="text-sm text-gray-600">Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('booking')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'booking'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Book Slots
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'location'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Location & Contact
              </button>
            </nav>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl"
            >
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-2xl font-bold mb-4">About {turf.name}</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">{turf.description}</p>
                  
                  {/* Additional details can be added here */}
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="font-semibold mb-2">Facilities</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Professional quality artificial turf</li>
                        <li>• Floodlights for night games</li>
                        <li>• Equipment available on rent</li>
                        <li>• First aid facilities</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Rules & Guidelines</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Sports shoes mandatory</li>
                        <li>• No smoking or alcohol</li>
                        <li>• Cancellation allowed up to 2 hours before</li>
                        <li>• Damage charges may apply</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'booking' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SlotBookingSystem turfId={turf._id} turfData={turf} />
            </motion.div>
          )}

          {activeTab === 'location' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl"
            >
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-2xl font-bold mb-4">Location & Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="mr-3 mt-1 text-gray-400" size={20} />
                    <div>
                      <h4 className="font-medium">Address</h4>
                      <p className="text-gray-600">{turf.location}</p>
                    </div>
                  </div>
                  
                  {/* Google Maps integration */}
                  <TurfLocationMap turf={turf} height="300px" />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="space-y-2 text-gray-600">
                        <p>Phone: +91 XXXXX XXXXX</p>
                        <p>Email: info@{turf.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Operating Hours</h4>
                      <div className="space-y-1 text-gray-600">
                        <p>Monday - Sunday: 24 Hours</p>
                        <p>Peak Hours: 6 AM - 11 AM, 5 PM - 10 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TurfDetail;
