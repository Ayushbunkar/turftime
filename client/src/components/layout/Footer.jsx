import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="relative bg-gray-950 text-white overflow-hidden z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
      >
        {/* Company Info */}
        <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
          <h3 className="text-3xl font-extrabold text-green-500 mb-4">TurfTime</h3>
          <p className="text-gray-300 mb-4 leading-relaxed">
            Book your perfect turf experience with ease. Play, compete, and enjoy with friends and family.
          </p>
          <div className="flex space-x-4 mt-4">
            {[
              { icon: <Facebook size={20} />, link: '#' },
              { icon: <Twitter size={20} />, link: '#' },
              { icon: <Instagram size={20} />, link: '#' }
            ].map((social, idx) => (
              <motion.a
                key={idx}
                href={social.link}
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="text-gray-400 hover:text-green-400 transition duration-300"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
          <h4 className="text-xl font-semibold mb-4 text-green-400">Quick Links</h4>
          <ul className="space-y-3 text-gray-300">
            <li><Link to="/" className="hover:text-green-400 transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-green-400 transition">About Us</Link></li>
            <li><Link to="/turfs" className="hover:text-green-400 transition">Explore Turfs</Link></li>
            <li><Link to="/contact" className="hover:text-green-400 transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
          <h4 className="text-xl font-semibold mb-4 text-green-400">Our Services</h4>
          <ul className="space-y-3 text-gray-300">
            <li><Link to="/turfs" className="hover:text-green-400 transition">Football Turfs</Link></li>
            <li><Link to="/turfs" className="hover:text-green-400 transition">Cricket Grounds</Link></li>
            <li><Link to="/events" className="hover:text-green-400 transition">Corporate Events</Link></li>
            <li><Link to="/tournaments" className="hover:text-green-400 transition">Tournaments</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
          <h4 className="text-xl font-semibold mb-4 text-green-400">Contact Us</h4>
          <ul className="space-y-4 text-gray-300 text-sm">
            <li className="flex items-start">
              <MapPin size={20} className="text-green-500 mr-3 mt-1" />
              <span>123 Sports Avenue, Stadium District, City, 12345</span>
            </li>
            <li className="flex items-center">
              <Phone size={20} className="text-green-500 mr-3" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center">
              <Mail size={20} className="text-green-500 mr-3" />
              <span>info@turftime.com</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800 text-center py-6 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} TurfTime. All rights reserved.
      </div>

      {/* Futuristic Glow Animation (Background Effect) */}
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </footer>
  );
};

export default Footer;
