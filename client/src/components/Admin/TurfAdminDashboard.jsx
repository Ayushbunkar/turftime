import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  Settings, 
  BarChart3,
  Download,
  Filter,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  X,
  Eye
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

const TurfAdminDashboard = ({ turfId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dashboardData, setDashboardData] = useState({
    slots: [],
    bookings: [],
    analytics: null,
    turf: null
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (turfId) {
      loadDashboardData();
    }
  }, [turfId, selectedDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [slotsRes, bookingsRes, analyticsRes] = await Promise.all([
        api.get(`/slots/turf/${turfId}/available?date=${selectedDate}`),
        api.get(`/slots/turf/${turfId}/bookings?date=${selectedDate}`),
        api.get(`/slots/turf/${turfId}/report?date=${selectedDate}`)
      ]);

      setDashboardData({
        slots: slotsRes.data.data || [],
        bookings: bookingsRes.data.data?.bookings || [],
        analytics: analyticsRes.data.data?.analytics,
        turf: analyticsRes.data.data?.turf
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotStatusUpdate = async (slotIds, status, reason = '') => {
    try {
      const response = await api.patch('/slots/availability', {
        slotIds,
        status,
        reason
      });

      if (response.data.success) {
        toast.success(`Slots marked as ${status}`);
        loadDashboardData(); // Reload data
      }
    } catch (error) {
      console.error('Error updating slot status:', error);
      toast.error('Failed to update slot status');
    }
  };

  const exportReport = async () => {
    try {
      const response = await api.get(`/slots/turf/${turfId}/report?date=${selectedDate}`);
      
      // Create and download CSV
      const data = response.data.data;
      const csv = generateCSVReport(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `turf-report-${selectedDate}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const generateCSVReport = (data) => {
    const headers = ['Time Slot', 'Status', 'Booking ID', 'Customer Name', 'Phone', 'Price', 'Payment Status'];
    let csv = headers.join(',') + '\n';
    
    data.slots?.forEach(slot => {
      const booking = data.bookings?.find(b => 
        b.timeSlots?.some(ts => ts._id === slot._id)
      );
      
      const row = [
        `"${slot.startTime} - ${slot.endTime}"`,
        slot.status,
        booking?.bookingRef || 'N/A',
        booking ? `"${booking.contactName}"` : 'N/A',
        booking?.contactPhone || 'N/A',
        slot.price,
        booking?.paymentStatus || 'N/A'
      ];
      csv += row.join(',') + '\n';
    });
    
    return csv;
  };

  const getSlotStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'booked': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'unavailable': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const OverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Stats Cards */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Total Slots</p>
            <p className="text-2xl font-bold text-gray-800">
              {dashboardData.analytics?.totalSlots || dashboardData.slots.length}
            </p>
          </div>
          <Calendar className="text-blue-600" size={24} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Booked Today</p>
            <p className="text-2xl font-bold text-green-600">
              {dashboardData.analytics?.bookedSlots || 0}
            </p>
          </div>
          <CheckCircle className="text-green-600" size={24} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Today's Revenue</p>
            <p className="text-2xl font-bold text-purple-600">
              ₹{dashboardData.analytics?.totalRevenue || 0}
            </p>
          </div>
          <IndianRupee className="text-purple-600" size={24} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Occupancy Rate</p>
            <p className="text-2xl font-bold text-orange-600">
              {dashboardData.analytics?.occupancyRate?.toFixed(1) || 0}%
            </p>
          </div>
          <TrendingUp className="text-orange-600" size={24} />
        </div>
      </div>
    </div>
  );

  const SlotsGridTab = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Slot Management - {new Date(selectedDate).toLocaleDateString()}</h3>
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border rounded-md text-sm">
            <option>Bulk Actions</option>
            <option value="maintenance">Mark as Maintenance</option>
            <option value="unavailable">Mark Unavailable</option>
            <option value="available">Mark Available</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {dashboardData.slots.map((slot) => {
          const booking = dashboardData.bookings.find(b => 
            b.timeSlots?.some(ts => ts._id === slot._id)
          );

          return (
            <div
              key={slot._id}
              className={`p-3 rounded-lg border-2 text-center cursor-pointer transition-all hover:shadow-md ${getSlotStatusColor(slot.status)}`}
            >
              <div className="text-sm font-medium mb-1">
                {slot.startTime}
              </div>
              <div className="text-xs mb-2">
                ₹{slot.price}
              </div>
              <div className="text-xs capitalize mb-2">
                {slot.status}
              </div>
              {booking && (
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="truncate">{booking.contactName}</div>
                  <div>{booking.contactPhone}</div>
                </div>
              )}
              {slot.status === 'available' && (
                <button
                  onClick={() => handleSlotStatusUpdate([slot._id], 'maintenance', 'Admin marked')}
                  className="text-xs text-red-600 hover:underline mt-1"
                >
                  Block
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const BookingsTab = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Today's Bookings</h3>
          <div className="flex items-center space-x-2">
            <Filter size={16} />
            <select className="px-3 py-2 border rounded-md text-sm">
              <option>All Statuses</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {dashboardData.bookings.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h4 className="text-lg font-medium text-gray-800 mb-2">No bookings today</h4>
            <p className="text-gray-600">All time slots are available for booking.</p>
          </div>
        ) : (
          dashboardData.bookings.map((booking) => (
            <div key={booking._id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="grid md:grid-cols-4 gap-4 items-center">
                <div>
                  <div className="font-medium text-gray-800">{booking.contactName}</div>
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    <Phone size={12} className="mr-1" />
                    {booking.contactPhone}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    <Mail size={12} className="mr-1" />
                    {booking.contactEmail}
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Clock size={12} className="mr-1" />
                    {booking.startTime} - {booking.endTime}
                  </div>
                  <div className="text-sm text-gray-600">
                    Duration: {booking.duration} hour{booking.duration > 1 ? 's' : ''}
                  </div>
                  {booking.teamSize && (
                    <div className="text-sm text-gray-600 flex items-center mt-1">
                      <Users size={12} className="mr-1" />
                      {booking.teamSize} players
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-lg font-semibold text-green-600 mb-1">
                    ₹{booking.totalPrice}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                    booking.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.paymentStatus}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <Eye size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <strong>Special Requests:</strong> {booking.specialRequests}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const AnalyticsTab = () => {
    const [analyticsRange, setAnalyticsRange] = useState('7d');
    
    return (
      <div className="space-y-6">
        {/* Date Range Selector */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Analytics Period</h3>
            <select 
              value={analyticsRange}
              onChange={(e) => setAnalyticsRange(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-medium text-gray-800 mb-4">Revenue Trends</h4>
            <div className="text-3xl font-bold text-green-600 mb-2">
              ₹{dashboardData.analytics?.totalRevenue || 0}
            </div>
            <p className="text-sm text-gray-600">Today's Revenue</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-medium text-gray-800 mb-4">Booking Patterns</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Peak Hours (6AM-11AM, 5PM-10PM)</span>
                <span className="text-sm font-medium">{dashboardData.analytics?.peakHourBookings || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Off-Peak Hours</span>
                <span className="text-sm font-medium">{dashboardData.analytics?.offPeakBookings || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-medium text-gray-800 mb-4">Performance Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Occupancy Rate</span>
                <span className="text-sm font-medium">{dashboardData.analytics?.occupancyRate?.toFixed(1) || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Price/Slot</span>
                <span className="text-sm font-medium">₹{dashboardData.analytics?.averagePricePerSlot?.toFixed(0) || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cancellation Rate</span>
                <span className="text-sm font-medium">{dashboardData.analytics?.cancellationRate?.toFixed(1) || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Booking Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="font-medium text-gray-800 mb-4">Hourly Booking Distribution</h4>
          <div className="grid grid-cols-12 gap-2 h-32">
            {Array.from({ length: 24 }, (_, i) => {
              const bookings = dashboardData.analytics?.hourlyBookings?.get(i.toString()) || 0;
              const maxBookings = Math.max(...Array.from({ length: 24 }, (_, j) => 
                dashboardData.analytics?.hourlyBookings?.get(j.toString()) || 0
              ));
              const height = maxBookings > 0 ? (bookings / maxBookings) * 100 : 0;
              
              return (
                <div key={i} className="flex flex-col items-center justify-end h-full">
                  <div 
                    className="bg-blue-500 w-full rounded-t"
                    style={{ height: `${height}%`, minHeight: bookings > 0 ? '4px' : '0' }}
                    title={`${i}:00 - ${bookings} bookings`}
                  />
                  <span className="text-xs text-gray-500 mt-1">{i}</span>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">Hour of Day (24-hour format)</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {dashboardData.turf?.name || 'Turf Dashboard'}
          </h1>
          <p className="text-gray-600">Manage your turf bookings and analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewTab />

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'slots', label: 'Slot Grid', icon: Calendar },
            { id: 'bookings', label: 'Bookings', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'slots' && <SlotsGridTab />}
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Turf Settings</h3>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TurfAdminDashboard;