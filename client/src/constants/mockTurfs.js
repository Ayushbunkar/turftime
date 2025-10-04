// Example mock data for turfs
const mockTurfs = [
  {
    id: 1,
    name: "Greenfield Arena",
    price: 1200,
    rating: 4.7,
    location: "Downtown",
    timeSlots: [
      { time: "6:00 AM - 7:00 AM", price: 1200, available: true },
      { time: "7:00 AM - 8:00 AM", price: 1200, available: true }
    ],
    features: ["Floodlights", "Parking", "Cafeteria"],
    image: "team1.jpg"
  },
  {
    id: 2,
    name: "Blue Turf Stadium",
    price: 1000,
    rating: 4.5,
    location: "Uptown",
    timeSlots: [
      { time: "8:00 AM - 9:00 AM", price: 1000, available: true },
      { time: "9:00 AM - 10:00 AM", price: 1000, available: true }
    ],
    features: ["Changing Rooms", "Parking"],
    image: "team2.jpg"
  },
  {
    id: 3,
    name: "Sunrise Sports Park",
    price: 900,
    rating: 4.3,
    location: "Suburbs",
    timeSlots: [
      { time: "10:00 AM - 11:00 AM", price: 900, available: true },
      { time: "11:00 AM - 12:00 PM", price: 900, available: true }
    ],
    features: ["Parking", "Cafeteria"],
    image: "team3.jpg"
  }
];

export default mockTurfs;
