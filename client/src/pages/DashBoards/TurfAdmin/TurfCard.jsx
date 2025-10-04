"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Dialog, DialogContent, DialogTrigger } from "../../../components/ui/Dialog.jsx";
import { MapPin, Star, Navigation, Eye, Heart, Share2, Shield, Users, Clock, Trophy, Percent } from "lucide-react";
import { weatherIcons } from "../../../constants/appConstants.js";
import TurfDetailsModal from "../../../components/Modals/TurfDetailsModal.jsx";

// Get count of available time slots
const getAvailableSlotsCount = (timeSlots) => {
  if (!Array.isArray(timeSlots)) {
    return 0;
  }
  return timeSlots.filter(slot => slot.available !== false && !slot.booked).length;
};

import turf1 from "../../../assets/turf1.webp";
import turf2 from "../../../assets/turf2.webp";
import turf3 from "../../../assets/turf3.webp";
import turf4 from "../../../assets/turf4.jpg";
import turf5 from "../../../assets/turf5.jpeg";
import turf6 from "../../../assets/turf6.webp";

const cardImages = [turf1, turf2, turf3, turf4, turf5, turf6];

const TurfCard = ({
  turf,
  viewMode,
  favorites,
  toggleFavorite,
  shareTurf,
  getDirections,
  setSelectedTurf,
  distance,
  index,
  image
}) => {
  const WeatherIcon = weatherIcons[turf?.weather?.condition] || weatherIcons.sunny;

  // Use the passed image prop if available (from MongoDB), else fallback to cardImages
  const getImageSrc = () => {
    if (image && typeof image === 'string') {
      // If it's a URL from MongoDB
      if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads/')) {
        return image;
      }
    }
    // Fallback to local images
    return cardImages[index % cardImages.length];
  };

  const cardImage = getImageSrc();

  const isListView = viewMode === "list";

  return (
    <Card
      className={`overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/95 backdrop-blur border border-green-200 hover:border-green-400 group ${isListView ? "flex" : ""}`}
    >
      {/* Turf Image */}
      <div className={`relative ${isListView ? "w-64 flex-shrink-0" : ""}`}>
        <div className="relative overflow-hidden">
          <img
            src={cardImage}
            alt={turf.name || "Turf"}
            className={`${isListView ? "h-full" : "h-48"} w-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-t-lg`}
            onError={e => { 
              e.target.onerror = null; 
              e.target.src = cardImages[0]; // Fallback to first local image
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          <Badge className="bg-green-100/90 backdrop-blur-sm text-green-700 border border-green-300 font-semibold">
            {typeof distance === "number" && !isNaN(distance)
              ? `${distance.toFixed(1)} km away`
              : (distance && typeof distance === "object" && distance.distance
                  ? `${distance.distance}${distance.duration ? ` (${distance.duration})` : ""} away`
                  : typeof distance === "string" && distance.length > 0
                    ? `${distance} away`
                    : "Enable location to see distance")}
          </Badge>
          {turf.loyaltyPoints && (
            <Badge className="bg-yellow-100/90 backdrop-blur-sm text-yellow-700 border border-yellow-300 font-semibold">+{turf.loyaltyPoints} pts</Badge>
          )}
        </div>

        {/* Favorite & Share Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-10 p-0 rounded-full bg-white/90 border border-gray-200 hover:bg-green-100 hover:border-green-400 transition-all duration-300 hover:scale-110 shadow"
            onClick={(e) => { e.stopPropagation(); toggleFavorite(turf.id); }}
          >
            <Heart
              className={`h-6 w-6 ${favorites.includes(turf.id) ? "fill-red-400 text-red-500" : "text-gray-400"} transition-colors duration-300`}
            />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-10 p-0 rounded-full bg-white/90 border border-gray-200 hover:bg-blue-100 hover:border-blue-400 transition-all duration-300 hover:scale-110 shadow"
            onClick={(e) => { e.stopPropagation(); shareTurf(turf); }}
          >
            <Share2 className="h-4 w-4 text-gray-500" />
          </Button>
        </div>

        {/* Weather Badge */}
        {turf.weather && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 flex items-center space-x-1 border border-green-100">
              <WeatherIcon className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-green-700">{turf.weather.temperature}°C</span>
            </div>
          </div>
        )}
      </div>

      {/* Turf Details */}
      <div className="flex-1 bg-white/80 rounded-b-lg">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl group-hover:text-green-700 transition-colors duration-300 flex items-center font-semibold">
                {turf.name || "Unknown Turf"}
                {turf.weatherDependent === false && (
                  <Shield className="h-4 w-4 ml-2 text-green-400" title="Weather Independent" />
                )}
              </CardTitle>
              <CardDescription className="flex items-center mt-2 text-gray-500 flex-wrap">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                {/* Show full address, wrap naturally, no cutting */}
                <span className="break-words">
                  {turf.address || "Address not available"}
                </span>
              </CardDescription>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium">{turf.rating || 0}</span>
                  <span className="ml-1 text-sm text-gray-400">({turf.reviews || 0})</span>
                </div>
                <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">{turf.surface || "Unknown"}</Badge>
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-green-600">₹{turf.price || 0}</div>
              <div className="text-sm text-gray-400">per hour</div>
              {Array.isArray(turf.groupDiscounts) && turf.groupDiscounts.length > 0 && (
                <Badge className="mt-1 bg-green-50 text-green-700 text-xs border border-green-200">
                  <Percent className="h-3 w-3 mr-1" />
                  Group discounts
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Amenities */}
            <div className="flex flex-wrap gap-1">
              {Array.isArray(turf.amenities) &&
                turf.amenities.slice(0, isListView ? 6 : 4).map((amenity) => (
                  <Badge
                    key={amenity}
                    variant="secondary"
                    className="text-xs bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 transition-colors duration-300"
                  >
                    {amenity}
                  </Badge>
                ))}
              {Array.isArray(turf.amenities) && turf.amenities.length > (isListView ? 6 : 4) && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500 border border-gray-200">
                  +{turf.amenities.length - (isListView ? 6 : 4)} more
                </Badge>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                <Users className="h-4 w-4 mx-auto text-green-500 mb-1" />
                <div className="text-xs text-gray-500">Capacity</div>
                <div className="text-sm font-semibold text-green-700">{turf.capacity || 0}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                <Clock className="h-4 w-4 mx-auto text-green-500 mb-1" />
                <div className="text-xs text-gray-500">Available</div>
                <div className="text-sm font-semibold text-green-700">{getAvailableSlotsCount(turf.timeSlots)} slots</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                <Trophy className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
                <div className="text-xs text-gray-500">Since</div>
                <div className="text-sm font-semibold text-green-700">{turf.established || "N/A"}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={getDirections}
                className="rounded-xl border border-green-300 hover:bg-green-50 hover:border-green-500 focus:border-green-500 active:border-green-500 transition-all duration-300 hover:scale-105 text-green-700"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Direction
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="rounded-xl bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 transition-all duration-300 hover:scale-105 hover:shadow-lg ml-auto text-white font-semibold"
                    onClick={() => setSelectedTurf(turf)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View & Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-green-100">
                  <TurfDetailsModal turf={turf} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default TurfCard;
