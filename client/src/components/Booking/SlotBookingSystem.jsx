import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  IndianRupee, 
  Users, 
  Phone, 
  Mail, 
  User, 
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const SlotBookingSystem = ({ turfId, turfData }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState('slots'); // 'slots', 'details', 'payment', 'success'
  const [bookingDetails, setBookingDetails] = useState({
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    teamSize: '',
    specialRequests: ''
  });

  // Load slots when date or turf changes
  useEffect(() => {
    if (turfId && selectedDate) {
      fetchSlots();
    }
  }, [turfId, selectedDate]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/slots/turf/${turfId}/available?date=${selectedDate}`);
      setSlots(response.data.data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelection = (slot) => {
    const isSelected = selectedSlots.some(s => s._id === slot._id);
    
    if (isSelected) {
      // Deselect slot
      setSelectedSlots(selectedSlots.filter(s => s._id !== slot._id));
    } else {
      // Select slot - check if it's consecutive
      const newSelectedSlots = [...selectedSlots, slot].sort((a, b) => a.slotNumber - b.slotNumber);
      
      // Check if slots are consecutive
      let isConsecutive = true;
      for (let i = 1; i < newSelectedSlots.length; i++) {
        if (newSelectedSlots[i].slotNumber !== newSelectedSlots[i - 1].slotNumber + 1) {
          isConsecutive = false;
          break;
        }
      }
      
      if (isConsecutive || selectedSlots.length === 0) {
        setSelectedSlots(newSelectedSlots);
      } else {
        toast.error('Please select consecutive time slots');
      }
    }
  };

  const calculateTotalPrice = () => {
    return selectedSlots.reduce((total, slot) => total + slot.price, 0);
  };

  const getTimeRange = () => {
    if (selectedSlots.length === 0) return '';
    const sortedSlots = [...selectedSlots].sort((a, b) => a.slotNumber - b.slotNumber);
    return `${sortedSlots[0].startTime} - ${sortedSlots[sortedSlots.length - 1].endTime}`;
  };

  const handleBookingSubmit = async () => {
    if (!bookingDetails.contactName || !bookingDetails.contactPhone || !bookingDetails.contactEmail) {
      toast.error('Please fill in all required contact details');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        turfId,
        slotIds: selectedSlots.map(slot => slot._id),
        ...bookingDetails,
        teamSize: parseInt(bookingDetails.teamSize) || 1
      };

      const response = await api.post('/slots/book', bookingData);
      
      if (response.data.success) {
        toast.success('Booking created successfully!');
        setBookingStep('payment');
        // Here you can integrate with Razorpay or other payment gateway
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const getSlotStatusColor = (slot) => {
    if (selectedSlots.some(s => s._id === slot._id)) {
      return 'bg-green-600 text-white border-green-600';
    }
    
    switch (slot.status) {
      case 'available':
        return slot.canBook?.() !== false 
          ? 'bg-white text-green-600 border-green-300 hover:bg-green-50 cursor-pointer'
          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed';
      case 'booked':
        return 'bg-red-100 text-red-600 border-red-200 cursor-not-allowed';
      case 'unavailable':
      case 'maintenance':
        return 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed';
      default:
        return 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed';
    }
  };

  const isSlotSelectable = (slot) => {
    return slot.status === 'available' && !slot.isBlocked && 
           new Date() < new Date(`${selectedDate}T${slot.startTime}:00`);
  };

  if (bookingStep === 'confirm') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Confirm Your Booking</h3>
        
        {/* Booking Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold mb-3">Booking Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Turf:</span>
              <span className="font-medium">{turfData?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-medium">{getTimeRange()}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>₹{calculateTotalPrice()}</span>
            </div>
          </div>
        </div>

        {/* Contact Details Form */}
        <div className="space-y-4 mb-6">
          <h4 className="font-semibold">Contact Details</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={bookingDetails.contactName}
                onChange={(e) => setBookingDetails({...bookingDetails, contactName: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={bookingDetails.contactPhone}
                onChange={(e) => setBookingDetails({...bookingDetails, contactPhone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={bookingDetails.contactEmail}
              onChange={(e) => setBookingDetails({...bookingDetails, contactEmail: e.target.value})}
              placeholder="Enter email address"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Size
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={bookingDetails.teamSize}
                onChange={(e) => setBookingDetails({...bookingDetails, teamSize: e.target.value})}
                placeholder="Number of players"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={bookingDetails.specialRequests}
              onChange={(e) => setBookingDetails({...bookingDetails, specialRequests: e.target.value})}
              placeholder="Any special requirements or notes..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => setBookingStep('select')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to Selection
          </button>
          <button
            onClick={handleBookingSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : `Confirm Booking - ₹${calculateTotalPrice()}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Book Your Slot</h2>
          <p className="text-gray-600">Select your preferred date and time slots</p>
        </div>

        {/* Date Selection */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            <Calendar className="inline-block mr-2" size={20} />
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlots([]); // Clear selection when date changes
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Selected Slots Summary */}
        {selectedSlots.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Selected Slots</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedSlots.map(slot => (
                <span key={slot._id} className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                  {slot.displayTime}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">
                Duration: {selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''} | 
                Time: {getTimeRange()}
              </span>
              <span className="text-lg font-bold text-green-800">
                Total: ₹{calculateTotalPrice()}
              </span>
            </div>
          </div>
        )}

        {/* Slots Grid */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            <Clock className="inline-block mr-2" size={20} />
            Available Time Slots
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading available slots...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {slots.map((slot) => (
                <motion.button
                  key={slot._id}
                  whileHover={isSlotSelectable(slot) ? { scale: 1.02 } : {}}
                  whileTap={isSlotSelectable(slot) ? { scale: 0.98 } : {}}
                  onClick={() => isSlotSelectable(slot) && handleSlotSelection(slot)}
                  className={`
                    p-3 rounded-lg border-2 text-center transition-all duration-200
                    ${getSlotStatusColor(slot)}
                  `}
                  disabled={!isSlotSelectable(slot)}
                >
                  <div className="text-sm font-medium">
                    {slot.startTime}
                  </div>
                  <div className="text-xs mt-1">
                    ₹{slot.price}
                  </div>
                  <div className="text-xs mt-1 capitalize">
                    {slot.status === 'available' && !isSlotSelectable(slot) ? 'Past' : slot.status}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Legend:</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white border-2 border-green-300 rounded mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded mr-2"></div>
              <span className="text-sm">Booked</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 border-2 border-gray-300 rounded mr-2"></div>
              <span className="text-sm">Unavailable</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        {selectedSlots.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={() => setBookingStep('confirm')}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
            >
              Continue to Booking Details
              <CreditCard className="ml-2" size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotBookingSystem;