import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Users,
  CalendarCheck,
  Flag,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import api from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

export default function TurfAdminHome({ darkMode = false }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    turfCount: 0,
    bookingCount: 0,
    revenue: 0,
    userCount: 0,
    turfGrowth: 0,
    bookingGrowth: 0,
    revenueGrowth: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get("/turfadmin/stats"),
          api.get("/turfadmin/bookings/recent")
        ]);

        setStats(statsRes.data);
        setRecentBookings(bookingsRes.data.data || bookingsRes.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (err.response?.status === 401) {
          console.log("Authentication failed - invalid token");
          return;
        }

        // Mock data fallback for demo
        setStats({
          turfCount: 3,
          bookingCount: 24,
          revenue: 12000,
          userCount: 50,
          turfGrowth: 33.3,
          bookingGrowth: 12.5,
          revenueGrowth: 15.2
        });
        setRecentBookings([
          {
            _id: "1",
            user: { name: "John Doe" },
            turf: { name: "Football Arena A" },
            date: new Date().toISOString(),
            timeSlot: "10:00 AM - 12:00 PM",
            amount: 1500,
            status: "confirmed"
          },
          {
            _id: "2", 
            user: { name: "Jane Smith" },
            turf: { name: "Cricket Ground B" },
            date: new Date(Date.now() - 86400000).toISOString(),
            timeSlot: "2:00 PM - 4:00 PM", 
            amount: 2000,
            status: "completed"
          }
        ]);
        toast.success("Demo data loaded (backend connection failed)");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name || 'Admin'}!
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Here's what's happening with your turfs today
            </p>
          </div>
          <Link
            to="/turfadmin/turfs"
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Turf
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Turfs Card */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Turfs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.turfCount}</p>
              <div className="flex items-center mt-2">
                {stats.turfGrowth >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${stats.turfGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(stats.turfGrowth)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Flag className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Bookings Card */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.bookingCount}</p>
              <div className="flex items-center mt-2">
                {stats.bookingGrowth >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${stats.bookingGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(stats.bookingGrowth)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Revenue Card */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{stats.revenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {stats.revenueGrowth >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(stats.revenueGrowth)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        {/* Users Card */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.userCount}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/turfadmin/turfs"
              className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Turf
            </Link>
            <Link
              to="/turfadmin/bookings"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Bookings
            </Link>
            <Link
              to="/turfadmin/analytics"
              className="flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
            <Link
              to="/turfadmin/bookings"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {booking.user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.user?.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.turf?.name || "Unknown Turf"} • {new Date(booking.date).toLocaleDateString()} • {booking.timeSlot}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{booking.amount}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        booking.status === "confirmed"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          : booking.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent bookings found</p>
              <p className="text-sm mt-1">New bookings will appear here</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
