import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchTurfs as fetchTurfsService } from "../../../services/turfAdminService";
import { fetchBookings as fetchBookingsService, updateBookingStatus, exportBookings as exportBookingsService } from "../../../services/bookingService";
import toast from "react-hot-toast";
import { Card } from "../../../components/ui/Card";
import { useOutletContext } from "react-router-dom";
import { 
  Search, 
  Calendar, 
  Filter, 
  DownloadCloud, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Clock,
  User,
  MapPin,
  DollarSign
} from "lucide-react";

export default function TurfAdminBookings() {
  const { darkMode } = useOutletContext() || {};
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    from: "",
    to: "",
    turfId: "all"
  });
  const [turfs, setTurfs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(10);

  useEffect(() => {
    fetchTurfs();
    fetchBookings();
  }, []);

  const fetchTurfs = async () => {
    try {
      const data = await fetchTurfsService();
      setTurfs(data);
    } catch (err) {
      console.error('Error fetching turfs:', err);
      toast.error('Could not fetch turfs');
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.turfId !== 'all') params.append('turfId', filters.turfId);
      const data = await fetchBookingsService(params.toString());
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Could not fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    fetchBookings();
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      from: '',
      to: '',
      turfId: 'all'
    });
    setTimeout(() => fetchBookings(), 0);
  };

  const exportBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.turfId !== 'all') params.append('turfId', filters.turfId);
      const data = await exportBookingsService(params.toString());
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export successful');
    } catch (err) {
      console.error('Error exporting bookings:', err);
      toast.error('Failed to export bookings');
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, { status: newStatus });
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
      toast.success('Booking status updated');
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update booking status');
    }
  };

  // Pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          
          <button
            onClick={exportBookings}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <DownloadCloud className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters section */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="turfId" className="block text-sm font-medium text-gray-700 mb-1">
                Turf
              </label>
              <select
                id="turfId"
                name="turfId"
                value={filters.turfId}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="all">All Turfs</option>
                {turfs.map(turf => (
                  <option key={turf._id} value={turf._id}>{turf.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="from"
                name="from"
                value={filters.from}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="to"
                name="to"
                value={filters.to}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search User Name/Email
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by user name or email"
                className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {/* Bookings table */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turf & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-700 font-medium">
                              {booking.user?.name?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.user?.name || "Unknown User"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.user?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.turf?.name}</div>
                        <div className="text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(booking.date).toLocaleDateString()}
                          </span>
                          <span>{booking.timeSlot}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{booking.amount}</div>
                        <div className="text-sm text-gray-500">
                          Duration: {booking.duration} hour(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === "confirmed" 
                            ? "bg-blue-100 text-blue-800"
                            : booking.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {booking.status === "pending" && (
                            <>
                              <button 
                                onClick={() => handleStatusChange(booking._id, "confirmed")}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => handleStatusChange(booking._id, "cancelled")}
                                className="text-red-600 hover:text-red-800"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          
                          {booking.status === "confirmed" && (
                            <button 
                              onClick={() => handleStatusChange(booking._id, "completed")}
                              className="text-green-600 hover:text-green-800"
                            >
                              Mark Completed
                            </button>
                          )}
                          
                          {(booking.status === "completed" || booking.status === "cancelled") && (
                            <span className="text-gray-400">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {bookings.length === 0 && (
              <div className="px-6 py-10 text-center text-gray-500">
                No bookings found matching your criteria
              </div>
            )}
            
            {/* Pagination */}
            {bookings.length > bookingsPerPage && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstBooking + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastBooking, bookings.length)}
                      </span>{" "}
                      of <span className="font-medium">{bookings.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 
                            ? "text-gray-300 cursor-not-allowed" 
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {/* Page buttons */}
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => paginate(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === i + 1
                              ? "z-10 bg-green-50 border-green-500 text-green-600"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages 
                            ? "text-gray-300 cursor-not-allowed" 
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}