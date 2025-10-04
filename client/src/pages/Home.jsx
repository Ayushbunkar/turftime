import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Testimonials from '../components/home/Testimonials';
import CallToAction from '../components/home/CallToAction';
import { motion } from 'framer-motion';
import { Calendar, Map, Clock } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/Card.jsx';
import { Link } from 'react-router-dom';

const featuredTurfs = [
  {
    id: 1,
    name: 'Green Valley Turf',
    location: 'Downtown Sports Complex',
    image:
      'https://imgs.search.brave.com/B7B-G8u1Y92YUp7YmUluwY8i0JBzQGvK1JEFy966aZg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvOTQ3/MzYzOTU4L3Bob3Rv/L2xvb2tpbmctZG93/bi1vbi1hLWNyaWNr/ZXQtYmFsbC1zaXR0/aW5nLWluLXRoZS1n/cmFzcy13aXRoLWEt/YmF0LW9uLWVkZ2Uu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PThPNXhQZlhOcE10/eWJKODhZa0N5b2t5/TVR1Y1JaMG01U3Bn/SkttZE1MTEU9',
    price: 50,
    rating: 4.8,
    type: '5-a-side',
  },
  {
    id: 2,
    name: 'Stadium Pitch',
    location: 'North City Arena',
    image:
      'https://images.unsplash.com/photo-1600679472829-3044539ce8ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    price: 65,
    rating: 4.9,
    type: '7-a-side',
  },
  {
    id: 3,
    name: 'Urban Football Arena',
    location: 'City Center',
    image:
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80',
    price: 55,
    rating: 4.7,
    type: '5-a-side',
  },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
     

      {/* Featured Turfs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured <span className="text-green-600">Turfs</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular turfs with excellent facilities and prime locations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTurfs.map((turf, index) => (
              <motion.div
                key={turf.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <div className="relative h-48">
                    <img
                      src={turf.image}
                      alt={turf.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-green-600 text-white px-3 py-1 m-2 rounded-full text-sm">
                      ₹{turf.price}/hr
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{turf.name}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Map size={16} className="mr-1" />
                      <span className="text-sm">{turf.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {turf.type}
                      </span>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-sm font-medium">{turf.rating}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link
                        to={`/booking/${turf.id}`}
                        className="flex items-center justify-center text-green-600 font-medium hover:text-green-700"
                      >
                        <Calendar size={16} className="mr-1" />
                        Book Now
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/turfs"
              className="inline-flex items-center text-green-600 font-medium hover:text-green-700"
            >
              View All Turfs
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
 <Features />
      <Testimonials />

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="text-green-600">Works</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Booking your perfect turf is quick and easy with our simple 3-step process.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map size={36} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Find a Turf</h3>
              <p className="text-gray-600">
                Browse through our collection of premium turfs and choose the one that suits your
                needs.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={36} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Book a Slot</h3>
              <p className="text-gray-600">
                Select your preferred date and time slot, and complete the booking with just a few
                clicks.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={36} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Play & Enjoy</h3>
              <p className="text-gray-600">
                Arrive at the turf, show your booking confirmation, and enjoy your game!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <CallToAction />
    </div>
  );
};

export default Home;
