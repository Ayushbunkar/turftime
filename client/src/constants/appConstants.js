import { Sun, Cloud, CloudRain, Wind } from "lucide-react"

export const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  windy: Wind,
}

export const demandColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  "very-high": "bg-red-100 text-red-800",
}

// Default user profile
export const defaultUserProfile = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+91 9876543210",
  loyaltyPoints: 450,
  membershipTier: "Gold",
}

// Default notifications
export const defaultNotifications = [
  { id: 1, message: "Your booking at Elite Sports Arena is confirmed!", type: "success", time: "2 hours ago" },
  { id: 2, message: "New tournament announced at Champions Ground", type: "info", time: "1 day ago" },
]

// Default filters
export const defaultFilters = {
  distance: [20],
  priceRange: [0, 2500],
  availability: "all",
  sortBy: "distance",
  surface: "all",
  amenities: [],
  rating: [0],
  weatherDependent: "all",
}
  