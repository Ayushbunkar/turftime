// Import images at the top
import turf1 from "./assets/turf1.webp";
import turf2 from "./assets/turf2.webp";
import turf3 from "./assets/turf3.webp";
import turf4 from "./assets/turf4.jpg";
import turf5 from "./assets/turf5.jpeg";
import turf6 from "./assets/turf6.webp";

// Demo/mock turfs for frontend testing
const mockTurfs = [
  {
    id: 1,
    name: "Blaze Turf",
    address: "DK-5, Opposite Virasha Heights, Danish Kunj, Kolar Rd, Bhopal, Madhya Pradesh 462042, India",
    description: "Premium football turf with night lighting.",
    price: 1200,
    rating: 4.7,
    surface: "Artificial Grass",
    weatherDependent: false,
    amenities: ["Parking", "Cafeteria", "Locker Room"],
    timeSlots: [
      { time: "6:00-7:00", available: true, price: 1200 },
      { time: "7:00-8:00", available: true, price: 1200 },
    ],
    location: { lat: 23.171574, lng: 77.423971 }, // Restored valid location
    established: "2018-01-01",
    reviews: 120,
    photo: turf1, // <-- imported image
  },
  {
    id: 2,
    name: "Kickoff Arena",
    address: "Hoshangabad Rd, Near Ashima Mall, Bawadia Kalan, Bhopal, Madhya Pradesh 462026, India",
    description: "Multi-sport turf with great facilities.",
    price: 1000,
    rating: 4.5,
    surface: "Natural Grass",
    weatherDependent: true,
    amenities: ["Parking", "Refreshments"],
    timeSlots: [
      { time: "8:00-9:00", available: true, price: 1000 },
      { time: "9:00-10:00", available: false, price: 1000 },
    ],
    location: { lat: 23.182904, lng: 77.456445 }, // Restored valid location
    established: "2016-05-15",
    reviews: 85,
    photo: turf2,
  },
  {
    id: 3,
    name: "Turfside Sports",
    address: "Ayodhya Bypass Rd, Near Sagar Public School, Bhopal, Madhya Pradesh 462041, India",
    description: "Spacious turf for football and cricket.",
    price: 900,
    rating: 4.2,
    surface: "Artificial Grass",
    weatherDependent: false,
    amenities: ["Parking", "Cafeteria"],
    timeSlots: [
      { time: "10:00-11:00", available: true, price: 900 },
      { time: "11:00-12:00", available: true, price: 900 },
    ],
    location: { lat: 23.182904, lng: 77.456445 }, // Restored valid location
    established: "2019-09-10",
    reviews: 60,
    photo: turf3,
  },
  {
    id: 4,
    name: "Green Goalz",
    address: "BHEL Township, Sector C, Govindpura, Bhopal, Madhya Pradesh 462023, India",
    description: "24/7 open turf for all sports.",
    price: 1500,
    rating: 4.8,
    surface: "Synthetic",
    weatherDependent: false,
    amenities: ["Parking", "Cafeteria", "Shower"],
    timeSlots: [
      { time: "12:00-13:00", available: true, price: 1500 },
      { time: "13:00-14:00", available: false, price: 1500 },
    ],
    location: { lat: 23.250678, lng: 77.480415 }, // Restored valid location
    established: "2020-03-20",
    reviews: 200,
    photo: turf4,
  },
  {
    id: 5,
    name: "Urban Soccer Park",
    address: "MP Nagar Zone-II, Near Habibganj Railway Station, Bhopal, Madhya Pradesh 462011, India",
    description: "Perfect turf for football enthusiasts.",
    price: 1100,
    rating: 4.4,
    surface: "Artificial Grass",
    weatherDependent: true,
    amenities: ["Parking", "Refreshments", "Locker Room"],
    timeSlots: [
      { time: "14:00-15:00", available: true, price: 1100 },
      { time: "15:00-16:00", available: true, price: 1100 },
    ],
    location: { lat: 23.2311, lng: 77.4336 }, // Restored valid location
    established: "2017-07-07",
    reviews: 95,
    photo: turf5,
  },
  {
    id: 6,
    name: "AstroPlay Bhopal",
    address: "Kotra Sultanabad, Near Taj-ul-Masajid, Bhopal, Madhya Pradesh 462003, India",
    description: "Family-friendly turf for all ages.",
    price: 950,
    rating: 4.1,
    surface: "Natural Grass",
    weatherDependent: false,
    amenities: ["Parking", "Cafeteria", "Kids Area"],
    timeSlots: [
      { time: "16:00-17:00", available: true, price: 950 },
      { time: "17:00-18:00", available: false, price: 950 },
    ],
    location: { lat: 23.250678, lng: 77.480415 }, // Restored valid location
    established: "2015-11-11",
    reviews: 50,
    photo: turf6,
  },
];

// All turf objects have a static, correct location property.

export default mockTurfs;