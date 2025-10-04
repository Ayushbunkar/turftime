import axios from "axios";

// Replace the API call with a mock implementation
export async function getDistanceFromGoogleMaps(origin, destination) {
  // Mock: return a random distance between 1 and 10 km after a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        distance: `${(Math.random() * 9 + 1).toFixed(1)} km`,
        duration: `${(Math.random() * 20 + 10).toFixed(0)} mins`,
      });
    }, 300);
  });
}
 
