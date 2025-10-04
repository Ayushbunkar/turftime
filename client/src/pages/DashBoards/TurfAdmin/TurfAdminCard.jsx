import React from "react";
import { motion } from "framer-motion";
import { 
  Edit, 
  Trash2, 
  MapPin, 
  Tag, 
  DollarSign, 
  Users, 
  Star,
  Eye,
  Clock,
  Calendar,
  Settings
} from "lucide-react";

const TurfAdminCard = ({ 
  turf, 
  onEdit, 
  onDelete, 
  onView,
  darkMode = false,
  index 
}) => {
  const sportTypeLabels = {
    football: "Football",
    cricket: "Cricket", 
    basketball: "Basketball",
    volleyball: "Volleyball",
    badminton: "Badminton",
    tennis: "Tennis",
    multiple: "Multiple Sports"
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={turf.images && turf.images.length > 0 
            ? (turf.images[0].startsWith('http') ? turf.images[0] : `${process.env.REACT_APP_API_URL || 'http://localhost:4500'}${turf.images[0]}`)
            : "https://via.placeholder.com/400x200?text=No+Image"
          }
          alt={turf.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x200?text=No+Image";
          }}
        />
        
        {/* Overlay with status */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(turf.isActive)}`}>
              {turf.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {/* Title overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg truncate">{turf.name}</h3>
            <div className="flex items-center text-white/80 text-sm mt-1">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span>{turf.rating || 0}</span>
              <span className="mx-2">•</span>
              <span>{turf.reviews || 0} reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Location and Sport Type */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center">
            <MapPin className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {turf.location}
            </span>
          </div>
          
          <div className="flex items-center">
            <Tag className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {sportTypeLabels[turf.sportType] || turf.sportType}
            </span>
          </div>

          <div className="flex items-center">
            <DollarSign className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {formatPrice(turf.pricePerHour)}/hour
            </span>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {turf.description}
        </p>

        {/* Stats */}
        {(turf.capacity || turf.size) && (
          <div className="flex items-center gap-4 mb-4">
            {turf.capacity && (
              <div className="flex items-center">
                <Users className={`w-4 h-4 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {turf.capacity} players
                </span>
              </div>
            )}
            {turf.size && (
              <div className="flex items-center">
                <Settings className={`w-4 h-4 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {turf.size}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Amenities */}
        {turf.amenities && turf.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {turf.amenities.slice(0, 3).map((amenity, i) => (
                <span 
                  key={i} 
                  className={`text-xs px-2 py-1 rounded-full ${
                    darkMode 
                      ? 'bg-green-900/20 text-green-400 border border-green-800' 
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {amenity}
                </span>
              ))}
              {turf.amenities.length > 3 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 border border-gray-600' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  +{turf.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Creation Date */}
        <div className="flex items-center mb-4">
          <Calendar className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Created {new Date(turf.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onView && onView(turf)}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              darkMode
                ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30 border border-blue-800'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </button>
          
          <button
            onClick={() => onEdit(turf)}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              darkMode
                ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30 border border-green-800'
                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
            }`}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
          
          <button
            onClick={() => onDelete(turf._id)}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              darkMode
                ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-800'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
            }`}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TurfAdminCard;