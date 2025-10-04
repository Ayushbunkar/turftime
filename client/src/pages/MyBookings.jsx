import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone, Mail, CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [currentPage, selectedStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      const response = await api.get(`/slots/my-bookings?${params}`);
      const data = response.data.data;
      
      setBookings(data.bookings);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setCancellingBooking(bookingId);
      const response = await api.patch(`/slots/cancel/${bookingId}`, {
        reason: cancelReason
      });
      
      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings(); // Refresh the list
        setCancellingBooking(null);
        setCancelReason('');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingBooking(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'cancelled':
        return <X size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'unpaid':
        return 'text-red-600';
      case 'refunded':
        return 'text-blue-600';
      case 'partial-refund':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const canCancelBooking = (booking) => {
    const now = new Date();
    const bookingDateTime = new Date(`${booking.bookingDate}T${booking.startTime}`);
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
    
    return hoursUntilBooking > 2 && 
           booking.status !== 'cancelled' && 
           booking.status !== 'completed' && 
           booking.status !== 'no-show';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">My Bookings</h1>
          <p className="text-gray-600">View and manage your turf bookings</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Calendar size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-4">
                {selectedStatus === 'all' 
                  ? "You haven't made any bookings yet." 
                  : `No ${selectedStatus} bookings found.`}
              </p>
              <button
                onClick={() => window.location.href = '/turfs'}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Turfs
              </button>
            </div>
          ) : (
            bookings.map((booking) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Turf Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start space-x-4">
                      {booking.turf?.images?.[0] && (
                        <img
                          src={booking.turf.images[0]}
                          alt={booking.turf.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-turf.jpg";
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {booking.turf?.name || 'Turf Name'}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin size={14} className="mr-1" />
                          <span className="text-sm">{booking.turf?.location}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </span>
                          <span className={`text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus === 'paid' ? '✓ Paid' : 
                             booking.paymentStatus === 'refunded' ? '↩ Refunded' :
                             booking.paymentStatus === 'partial-refund' ? '↩ Partial Refund' :
                             '⚠ Unpaid'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={14} className="mr-2" />
                        <span className="text-sm">{formatDate(booking.bookingDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={14} className="mr-2" />
                        <span className="text-sm">{booking.timeDisplay || `${booking.startTime} - ${booking.endTime}`}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Duration: {booking.duration} hour{booking.duration > 1 ? 's' : ''}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        ₹{booking.totalPrice}
                      </div>
                    </div>
                  </div>

                  {/* Contact & Actions */}
                  <div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone size={12} className="mr-2" />
                        {booking.contactPhone}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail size={12} className="mr-2" />
                        {booking.contactEmail}
                      </div>
                      {booking.teamSize && (
                        <div className="text-sm text-gray-600">
                          Team Size: {booking.teamSize} players
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      {booking.paymentStatus === 'unpaid' && booking.status === 'pending' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                          Pay Now
                        </button>
                      )}
                      
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => setCancellingBooking(booking._id)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm"
                        >
                          Cancel Booking
                        </button>
                      )}

                      <div className="text-xs text-gray-500">
                        Ref: {booking.bookingRef || `TRF-${booking._id.slice(-6).toUpperCase()}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Special Requests:</strong> {booking.specialRequests}
                    </p>
                  </div>
                )}

                {/* Cancellation Details */}
                {booking.status === 'cancelled' && booking.cancellationReason && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-red-600">
                      <strong>Cancellation Reason:</strong> {booking.cancellationReason}
                    </p>
                    {booking.refundAmount > 0 && (
                      <p className="text-sm text-blue-600 mt-1">
                        <strong>Refund Amount:</strong> ₹{booking.refundAmount}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Booking Modal */}
        {cancellingBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Cancel Booking</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this booking? Please provide a reason:
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                rows="3"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setCancellingBooking(null);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCancelBooking(cancellingBooking)}
                  disabled={!cancelReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;