import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Tag,
  Users,
  ChevronLeft,
  ChevronRight,
  Trophy
} from 'lucide-react';

const featuresList = [
  {
    icon: <Calendar size={36} className="text-green-600" />,
    title: 'Easy Booking',
    description: 'Book your preferred turf with just a few clicks, anytime and anywhere.'
  },
  {
    icon: <MapPin size={36} className="text-green-600" />,
    title: 'Multiple Locations',
    description: 'Choose from various turfs located across the city for your convenience.'
  },
  {
    icon: <Clock size={36} className="text-green-600" />,
    title: 'Flexible Hours',
    description: 'Morning or night, weekday or weekend - play whenever suits you best.'
  },
  {
    icon: <Users size={36} className="text-green-600" />,
    title: 'Various Formats',
    description: '5-a-side, 7-a-side or full pitch - we have options for all team sizes.'
  },
  {
    icon: <Shield size={36} className="text-green-600" />,
    title: 'Premium Facilities',
    description: 'Enjoy top-quality turf, changing rooms, and other premium amenities.'
  },
  {
    icon: <Tag size={36} className="text-green-600" />,
    title: 'Best Prices',
    description: 'Competitive pricing with special discounts for regular players.'
  },
  {
    icon: <Shield size={36} className="text-green-600" />,
    title: 'Secure Payments',
    description: 'All transactions are safe, encrypted and protected for a smooth experience.'
  },
  {
    icon: <Users size={36} className="text-green-600" />,
    title: 'Community Events',
    description: 'Join local matches, tournaments, and social football meetups.'
  },
  {
    icon: <Trophy size={36} className="text-green-600" />,
    title: 'Tournaments & Rewards',
    description: 'Participate in tournaments and win exciting rewards and trophies.'
  }
];

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px 0px' });
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => setCurrentIndex((prev) => (prev === featuresList.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? featuresList.length - 1 : prev - 1));

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="text-green-600">TurfTime</span>?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            We provide the best turf booking experience with premium facilities and seamless service.
          </p>
        </motion.div>

        {/* Grid for Desktop and Tablet */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Carousel for Mobile */}
        <div className="md:hidden relative mt-6">
          <div className="overflow-hidden">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              key={currentIndex}
            >
              <div className="mb-4 flex justify-center">{featuresList[currentIndex].icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                {featuresList[currentIndex].title}
              </h3>
              <p className="text-gray-600 text-center text-sm">
                {featuresList[currentIndex].description}
              </p>
            </motion.div>
          </div>

          {/* Navigation Dots & Buttons */}
          <div className="flex justify-center mt-4 items-center gap-4">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-1">
              {featuresList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    currentIndex === index ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
