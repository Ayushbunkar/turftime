import React from 'react';
import { motion } from 'framer-motion';
import teamImg1 from '../assets/team1.jpg';
import teamImg2 from '../assets/team2.jpg';
import teamImg3 from '../assets/team3.jpg'; // Use your own images

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: 'easeOut' },
};

const About = () => {
  return (
    <div className="min-h-screen pt-10 bg-white text-[#3b3b3b]">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center">
            <h1 className="text-5xl font-extrabold mb-4">About Us</h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Our journey to revolutionize turf booking and empower sports lovers.
            </p>
          </motion.div>
        </div>
      </section>

     
    
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8">
          <motion.div {...fadeInUp} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-2 text-green-700">Our Mission</h3>
            <p className="text-gray-600">
              To simplify turf discovery and booking for sports lovers, and build a community around fitness and play.
            </p>
          </motion.div>
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-2 text-green-700">Our Vision</h3>
            <p className="text-gray-600">
              A future where every athlete, casual or pro, can access world-class playing spaces just a click away.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 {...fadeInUp} className="text-3xl font-bold mb-8">
            Meet the <span className="text-green-600">Team</span>
          </motion.h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[teamImg1, teamImg2, teamImg3].map((img, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                {...fadeInUp}
                transition={{ delay: idx * 0.2 }}
                className="bg-white rounded-xl shadow-lg p-4"
              >
                <img src={img} alt={`Team ${idx + 1}`} className="w-full h-56 object-cover rounded-lg mb-4" />
                <h4 className="text-xl font-semibold">Team Member {idx + 1}</h4>
                <p className="text-gray-600 text-sm">Role: Developer / Strategist / Designer</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline - Journey */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="container mx-auto px-4">
          <motion.h2 {...fadeInUp} className="text-3xl font-bold text-center mb-12">
            Our <span className="text-green-600">Journey</span>
          </motion.h2>
          <div className="relative border-l-4 border-green-600 pl-6 space-y-10">
            {[
              {
                year: '2023',
                desc: 'Founded the idea after struggling with weekend turf bookings.'
              },
              {
                year: '2024',
                desc: 'Launched the beta with 10+ turfs and hundreds of bookings.'
              },
              {
                year: '2025',
                desc: 'Expanded to 4 cities with thousands of users and new features.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.3 }}
                className="bg-white p-4 rounded-lg shadow relative"
              >
                <span className="absolute -left-7 top-4 w-6 h-6 bg-green-600 rounded-full border-4 border-white"></span>
                <h4 className="text-xl font-semibold text-green-700">{item.year}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="container mx-auto px-4 pt-20 text-center">
          <motion.h2 {...fadeInUp} className="text-3xl font-bold mb-4">
            Our <span className="text-green-600">Story</span>
          </motion.h2>
          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-3xl mx-auto text-gray-600"
          >
            What started as a weekend struggle to find and book football grounds quickly grew into an idea. 
            We built this platform to help sports enthusiasts save time, discover nearby turfs, and make bookings 
            easy, fast, and reliable. From local players to professionals, our mission is to connect you to the game.
          </motion.p>
        </div>
        </div>
      </section>
    </div>
  );
};

export default About;
