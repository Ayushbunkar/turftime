import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  IndianRupee, 
  Users, 
  Phone, 
  Mail, 
  User,
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const QuickBookingModal = ({ turf, isOpen, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState('slots'); // 'slots', 'details', 'confirmation'
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    teamSize: '',
    specialRequests: ''
  });

  // Load slots when date changes
  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchSlots();
    }
  }, [isOpen, selectedDate, turf?._id]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      // Generate time slots (since we might not have a slots API yet)
      const slots = generateTimeSlots();
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots for demonstration
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 6;
    const endHour = 22;
    
    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      // Randomly mark some slots as booked for demo
      const isBooked = Math.random() > 0.7;
      const price = turf?.pricePerHour || 500;
      
      slots.push({
        _id: `${selectedDate}_${hour}`,
        startTime,
        endTime,
        displayTime: `${startTime} - ${endTime}`,
        price: price,
        status: isBooked ? 'booked' : 'available',
        slotNumber: hour - startHour + 1
      });
    }
    
    return slots;
  };

  const handleSlotSelection = (slot) => {
    if (slot.status !== 'available') return;
    
    const isSelected = selectedSlots.some(s => s._id === slot._id);
    
    if (isSelected) {
      setSelectedSlots(selectedSlots.filter(s => s._id !== slot._id));
    } else {
      // For quick booking, allow multiple non-consecutive slots
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const calculateTotal = () => {
    return selectedSlots.reduce((total, slot) => total + slot.price, 0);
  };

  const getTimeRange = () => {
    if (selectedSlots.length === 0) return '';
    const sortedSlots = [...selectedSlots].sort((a, b) => a.slotNumber - b.slotNumber);
    if (selectedSlots.length === 1) {
      return sortedSlots[0].displayTime;
    }
    return `${sortedSlots[0].startTime} - ${sortedSlots[sortedSlots.length - 1].endTime}`;
  };

  const handleBookingSubmit = async () => {
    // Validate form
    if (!bookingDetails.contactName || !bookingDetails.contactPhone || !bookingDetails.contactEmail) {
      toast.error('Please fill in all required contact details');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate booking API call
      const bookingData = {
        turfId: turf._id,
        date: selectedDate,
        slots: selectedSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: slot.price
        })),
        totalAmount: calculateTotal(),
        ...bookingDetails,
        teamSize: parseInt(bookingDetails.teamSize) || 1
      };

      console.log('Booking data:', bookingData);
      
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success
      setStep('confirmation');
      toast.success('Booking request submitted successfully!');
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('slots');
    setSelectedSlots([]);
    setBookingDetails({
      contactName: user?.name || '',
      contactPhone: user?.phone || '',
      contactEmail: user?.email || '',
      teamSize: '',
      specialRequests: ''
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!turf) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-green-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{turf.name}</h2>
                  <p className="text-green-100 mt-1">{turf.location || turf.address}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-green-700 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Steps Indicator */}
              <div className="flex items-center mt-4 space-x-4">
                <div className={`flex items-center ${step === 'slots' ? 'text-white' : 'text-green-200'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    step === 'slots' ? 'bg-white text-green-600' : 'bg-green-500'
                  }`}>
                    1
                  </div>
                  <span className="hidden sm:block">Select Slots</span>
                </div>
                <div className="flex-1 h-px bg-green-500"></div>
                <div className={`flex items-center ${step === 'details' ? 'text-white' : 'text-green-200'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    step === 'details' ? 'bg-white text-green-600' : 'bg-green-500'
                  }`}>
                    2
                  </div>
                  <span className="hidden sm:block">Details</span>
                </div>
                <div className="flex-1 h-px bg-green-500"></div>
                <div className={`flex items-center ${step === 'confirmation' ? 'text-white' : 'text-green-200'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    step === 'confirmation' ? 'bg-white text-green-600' : 'bg-green-500'
                  }`}>
                    3
                  </div>
                  <span className="hidden sm:block">Confirm</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Step 1: Select Slots */}
              {step === 'slots' && (
                <div>
                  <div className="mb-6">
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      <Calendar className="inline-block mr-2" size={20} />
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
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
                          Duration: {selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''}
                        </span>
                        <span className="text-lg font-bold text-green-800">
                          Total: ₹{calculateTotal()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Time Slots Grid */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      <Clock className="inline-block mr-2" size={20} />
                      Available Time Slots
                    </h3>
                    
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading slots...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedSlots.some(s => s._id === slot._id);
                          const isAvailable = slot.status === 'available';
                          
                          return (
                            <button
                              key={slot._id}
                              onClick={() => handleSlotSelection(slot)}
                              disabled={!isAvailable}
                              className={`
                                p-3 rounded-lg border-2 text-center transition-all duration-200
                                ${isSelected 
                                  ? 'bg-green-600 text-white border-green-600' 
                                  : isAvailable
                                    ? 'bg-white text-green-600 border-green-300 hover:bg-green-50 cursor-pointer'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                }
                              `}
                            >
                              <div className="text-sm font-medium">
                                {slot.startTime}
                              </div>
                              <div className="text-xs mt-1">
                                ₹{slot.price}
                              </div>
                              <div className="text-xs mt-1 capitalize">
                                {slot.status}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Booking Details */}
              {step === 'details' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Booking Details</h3>
                  
                  {/* Booking Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
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
                        <span>₹{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Form */}
                  <div className="space-y-4">
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team Size
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={turf.capacity || 22}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={bookingDetails.teamSize}
                        onChange={(e) => setBookingDetails({...bookingDetails, teamSize: e.target.value})}
                        placeholder="Number of players"
                      />
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
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 'confirmation' && (
                <div className="text-center">
                  <div className="mb-6">
                    <CheckCircle className="text-green-600 mx-auto mb-4" size={64} />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Submitted!</h3>
                    <p className="text-gray-600">
                      Your booking request has been submitted successfully. You will receive a confirmation shortly.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-green-800 mb-2">Booking Details</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Turf:</strong> {turf.name}</p>
                      <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {getTimeRange()}</p>
                      <p><strong>Total Amount:</strong> ₹{calculateTotal()}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <AlertTriangle className="text-yellow-600 mr-2 mt-0.5" size={20} />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Next Steps:</p>
                        <ul className="mt-1 space-y-1">
                          <li>• You will receive a confirmation call/email within 2 hours</li>
                          <li>• Payment can be made at the venue or online</li>
                          <li>• Please arrive 10 minutes before your booking time</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {step === 'confirmation' ? 'Close' : 'Cancel'}
              </button>
              
              <div className="flex gap-3">
                {step === 'details' && (
                  <button
                    onClick={() => setStep('slots')}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                
                {step === 'slots' && selectedSlots.length > 0 && (
                  <button
                    onClick={() => setStep('details')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Continue
                  </button>
                )}
                
                {step === 'details' && (
                  <button
                    onClick={handleBookingSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Submitting...' : `Confirm Booking - ₹${calculateTotal()}`}
                  </button>
                )}

                {step === 'confirmation' && (
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickBookingModal;