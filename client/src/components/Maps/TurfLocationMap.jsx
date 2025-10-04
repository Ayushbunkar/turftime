import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Star, ExternalLink } from 'lucide-react';

// Fallback map styling
const mapContainerStyle = {
  width: '100%',
  height: '400px',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  border: '1px solid #e5e7eb'
};

const TurfLocationMap = ({ 
  turf, 
  turfs = [], 
  showMultipleTurfs = false, 
  onTurfSelect = null,
  height = '400px'
}) => {
  const [selectedTurf, setSelectedTurf] = useState(null);

  // Open external map (Google Maps, Apple Maps, etc.)
  const openExternalMap = (turfItem) => {
    const address = encodeURIComponent(`${turfItem.name}, ${turfItem.location?.address || turfItem.location || ''}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(url, '_blank');
  };

  // Get directions to turf
  const getDirections = (turfItem) => {
    const address = encodeURIComponent(`${turfItem.name}, ${turfItem.location?.address || turfItem.location || ''}`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(url, '_blank');
  };

  // Mock distance calculation (since we don't have real coordinates)
  const getMockDistance = () => {
    return (Math.random() * 10 + 1).toFixed(1); // Random distance between 1-11 km
  };

  if (showMultipleTurfs && turfs.length > 0) {
    // Multiple turfs list view
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Turf Locations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {turfs.map((turfItem) => (
            <div key={turfItem._id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-2">{turfItem.name}</h4>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-2 text-gray-400" />
                      <span>{turfItem.location?.address || turfItem.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-2 text-gray-400" />
                      <span>₹{turfItem.pricePerHour}/hour</span>
                    </div>
                    {turfItem.rating > 0 && (
                      <div className="flex items-center">
                        <Star size={14} className="mr-2 text-yellow-400 fill-current" />
                        <span>{turfItem.rating.toFixed(1)} rating</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Navigation size={14} className="mr-2 text-gray-400" />
                      <span>{getMockDistance()} km away (estimated)</span>
                    </div>
                  </div>
                </div>
                {turfItem.images?.[0] && (
                  <img
                    src={turfItem.images[0]}
                    alt={turfItem.name}
                    className="w-16 h-16 object-cover rounded-md ml-3"
                  />
                )}
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => getDirections(turfItem)}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  <Navigation size={14} className="mr-1" />
                  Directions
                </button>
                <button
                  onClick={() => openExternalMap(turfItem)}
                  className="flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  <ExternalLink size={14} className="mr-1" />
                  View Map
                </button>
                <button
                  onClick={() => {
                    if (onTurfSelect) {
                      onTurfSelect(turfItem);
                    } else {
                      window.location.href = `/turfs/${turfItem._id}`;
                    }
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Single turf view
  if (!turf) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <MapPin className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-gray-600">No location data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Static map placeholder */}
      <div 
        className="flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-dashed border-green-200"
        style={{ height }}
      >
        <div className="text-center p-8">
          <MapPin className="mx-auto text-green-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{turf.name}</h3>
          <p className="text-gray-600 mb-4">
            {turf.location?.address || turf.location || 'Location not specified'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => getDirections(turf)}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Navigation size={16} className="mr-2" />
              Get Directions
            </button>
            <button
              onClick={() => openExternalMap(turf)}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              Open in Maps
            </button>
          </div>
        </div>
      </div>

      {/* Location info panel */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 mb-1">Location Details</h4>
            <p className="text-sm text-gray-600 mb-2">
              {turf.location?.address || turf.location || 'Address not specified'}
            </p>
            {turf.location?.city && (
              <p className="text-sm text-gray-600 mb-2">
                {turf.location.city}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center text-green-600">
                <Clock size={14} className="mr-1" />
                <span>₹{turf.pricePerHour}/hour</span>
              </div>
              {turf.rating > 0 && (
                <div className="flex items-center text-yellow-600">
                  <Star size={14} className="mr-1 fill-current" />
                  <span>{turf.rating.toFixed(1)} rating</span>
                </div>
              )}
              <div className="flex items-center text-blue-600">
                <Navigation size={14} className="mr-1" />
                <span>{getMockDistance()} km away</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map unavailable notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center">
          <MapPin className="text-amber-600 mr-3" size={20} />
          <div>
            <h5 className="font-medium text-amber-800">Interactive Map Unavailable</h5>
            <p className="text-sm text-amber-700">
              Google Maps integration is disabled. Use the buttons above to open location in your preferred maps app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfLocationMap;