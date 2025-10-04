import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Filter, Search, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import Sidebar from './Sidebar';
import Navbar from '../../../components/layout/Navbar';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';

const UserBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch bookings from backend
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      const response = await api.get('/bookings/user');
      setBookings(response.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.turf?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.turfName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancelLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:4500/api/bookings/${selectedBooking._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update booking status locally
      setBookings(bookings.map(booking => 
        booking._id === selectedBooking._id 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));

      toast.success('Booking cancelled successfully');
      setShowCancelModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelBooking = (booking) => {
    return booking.status === 'confirmed' || booking.status === 'pending';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Please log in to view your bookings</div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-gray-900 dark:to-gray-800`}>
      <Navbar user={user} onToggleDark={() => setDarkMode(!darkMode)} />
      <div className="flex">
        <Sidebar user={user} onToggleDark={() => setDarkMode(!darkMode)} darkMode={darkMode} />
        <main className="flex-1 ml-64 p-4 mt-20 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Bookings
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your turf reservations and booking history
              </p>
            </div>

            {/* Search and Filter */}
            <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by turf name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Bookings List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBookings.map((booking) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {booking.turf?.name || booking.turfName || 'Unknown Turf'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="mr-2 h-4 w-4" />
                          {booking.timeSlot}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="mr-2 h-4 w-4" />
                          {booking.turf?.location || 'Location not available'}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                        <div className="font-medium text-gray-900 dark:text-white">
                          ₹{booking.amount || booking.price}
                        </div>
                        <div className="flex space-x-2">
                          {canCancelBooking(booking) && (
                            <button
                              onClick={() => openCancelModal(booking)}
                              className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          )}
                          <Link
                            to={`/turfs/${booking.turf?._id || booking.turfId}`}
                            className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
                          >
                            View Turf
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : "You haven't made any bookings yet"}
                </p>
                <Link
                  to="/turfs"
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  Browse Turfs
                </Link>
              </Card>
            )}
          </motion.div>
        </main>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cancel Booking
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to cancel your booking for <strong>{selectedBooking?.turf?.name || selectedBooking?.turfName}</strong> 
              on {new Date(selectedBooking?.date).toLocaleDateString()}?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
                disabled={cancelLoading}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings;