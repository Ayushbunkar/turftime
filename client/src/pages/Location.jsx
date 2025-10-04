import { useEffect, useState } from "react";
import { openGoogleMapsDirections } from "../utils/turfUtils";
import { useLocation } from "react-router-dom";

const DEFAULT_LOCATION = { lat: 23.2599, lng: 77.4126 }; // Bhopal fallback

const Location = ({ onLocation }) => {
  // Get turf location from query params (e.g., /location?lat=...&lng=...)
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const lat = parseFloat(params.get("lat"));
  const lng = parseFloat(params.get("lng"));

  const [coords, setCoords] = useState(() => {
    // Try to get from localStorage first
    try {
      const stored = localStorage.getItem("userLocation");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed &&
          typeof parsed.lat === "number" &&
          typeof parsed.lng === "number"
        ) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(!coords);
  const [error, setError] = useState("");

  useEffect(() => {
    if (coords) {
      setLoading(false);
      setError("");
      if (onLocation) onLocation(coords);
      return;
    }
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setCoords(userCoords);
          setLoading(false);
          setError("");
          localStorage.setItem("userLocation", JSON.stringify(userCoords));
          if (onLocation) onLocation(userCoords);
        },
        (err) => {
          setError("Location permission denied or unavailable.");
          setCoords(DEFAULT_LOCATION);
          setLoading(false);
          localStorage.setItem("userLocation", JSON.stringify(DEFAULT_LOCATION));
          if (onLocation) onLocation(DEFAULT_LOCATION);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setCoords(DEFAULT_LOCATION);
      setLoading(false);
      localStorage.setItem("userLocation", JSON.stringify(DEFAULT_LOCATION));
      if (onLocation) onLocation(DEFAULT_LOCATION);
    }
  }, [onLocation, coords]);

  const goToTurfWithLocation = () => {
    if (!isNaN(lat) && !isNaN(lng)) {
      openGoogleMapsDirections({ lat, lng });
    } else {
      alert("Invalid turf location.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-8 max-w-md mx-auto mt-16">
      <div className="w-full text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          Find Your Turf
        </h2>
        {loading ? (
          <div className="py-8 text-green-600 font-medium animate-pulse">
            Fetching your location...
          </div>
        ) : error ? (
          <div className="py-4 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
            <br />
            <span className="text-xs text-gray-500">
              Using default location.
            </span>
          </div>
        ) : (
          <div className="mb-6">
            <div className="text-green-800 font-semibold">Your location:</div>
            <div className="text-green-600 text-lg font-mono">
              {coords.lat}, {coords.lng}
            </div>
          </div>
        )}
        <button
          className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition font-semibold text-lg disabled:opacity-60"
          onClick={goToTurfWithLocation}
          disabled={loading}
        >
          Go to Turf
        </button>
      </div>
    </div>
  );
};

export default Location;
