import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const Booking = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name || !email || !dateTime) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/bookings', {
        name,
        email,
        dateTime,
      });
      navigate('/payment', { state: { bookingDetails: res.data } });
    } catch (err) {
      console.error(err);
      setError('Error booking turf. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-white">
      <section className="py-16 bg-green-600">
        {/* ... (hero section content) ... */}
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg mx-auto bg-gray-100 p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Booking Form</h2>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 border border-gray-300 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-3 border border-gray-300 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <DatePicker
                selected={dateTime}
                onChange={(date) => setDateTime(date)}
                showTimeSelect
                dateFormat="Pp"
                className="w-full p-3 border border-gray-300 rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Book Now'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Booking;