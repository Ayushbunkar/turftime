import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Search,
  Sun,
  Moon,
  Settings,
  User,
  LogOut,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Menu
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const SuperAdminNavbar = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    // Fetch notifications and system alerts
    fetchNotifications();
    fetchSystemAlerts();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4500/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set mock notifications for demo
      setNotifications([
        {
          id: 1,
          type: 'warning',
          title: 'High Server Load',
          message: 'Server CPU usage is at 85%',
          time: '2 mins ago',
          read: false
        },
        {
          id: 2,
          type: 'success',
          title: 'New Turf Admin Registered',
          message: 'John Doe has registered as a turf admin',
          time: '15 mins ago',
          read: false
        },
        {
          id: 3,
          type: 'info',
          title: 'Daily Report Ready',
          message: 'Your daily analytics report is available',
          time: '1 hour ago',
          read: true
        }
      ]);
    }
  };

  const fetchSystemAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4500/api/admin/system-alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      // Set mock alerts for demo
      setSystemAlerts([
        { type: 'warning', message: 'Database backup overdue', severity: 'medium' },
        { type: 'success', message: 'All services operational', severity: 'low' }
      ]);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Page Title */}
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Super Admin Panel
            </h1>
          </div>

          {/* System Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              All Systems Operational
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, turfs, bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Quick Stats */}
          <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-600 dark:text-slate-300">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>1,247 Users</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>23 Admins</span>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50"
              >
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {unreadCount} unread notifications
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Settings */}
          <button className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user?.name?.charAt(0) || 'S'}
                </span>
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user?.name || 'Super Admin'}
              </span>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50"
              >
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {user?.name?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name || 'Super Admin'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {user?.email || 'admin@turfown.com'}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        <span className="text-xs text-green-500">Super Admin</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                    <Settings className="w-4 h-4" />
                    <span>System Settings</span>
                  </button>
                  <div className="border-t border-gray-200 dark:border-slate-700 mt-2 pt-2">
                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default SuperAdminNavbar;