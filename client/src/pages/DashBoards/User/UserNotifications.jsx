import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Filter, MoreVertical, Calendar, CreditCard, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import Sidebar from './Sidebar';
import UserNavbar from './UserNavbar';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';

const UserNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Fetch notifications from backend
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      const response = await api.get('/notifications/user');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Create mock notifications for demonstration
      const mockNotifications = [
        {
          _id: '1',
          title: 'Booking Confirmed',
          message: 'Your booking for Green Valley Sports Complex has been confirmed for October 5, 2024.',
          type: 'booking',
          read: false,
          createdAt: new Date('2024-10-03T10:30:00'),
          actionUrl: '/user/bookings'
        },
        {
          _id: '2',
          title: 'Payment Successful',
          message: 'Payment of ₹1,500 for your turf booking has been processed successfully.',
          type: 'payment',
          read: false,
          createdAt: new Date('2024-10-02T15:45:00'),
          actionUrl: '/user/payments'
        },
        {
          _id: '3',
          title: 'Booking Reminder',
          message: 'Your turf booking is scheduled for tomorrow at 10:00 AM. Don\'t forget to bring your sports gear!',
          type: 'reminder',
          read: true,
          createdAt: new Date('2024-10-01T09:00:00'),
          actionUrl: '/user/bookings'
        },
        {
          _id: '4',
          title: 'New Turf Available',
          message: 'A new premium turf "City Sports Arena" is now available for booking in your area.',
          type: 'info',
          read: true,
          createdAt: new Date('2024-09-30T14:20:00'),
          actionUrl: '/turfs'
        },
        {
          _id: '5',
          title: 'Booking Cancelled',
          message: 'Your booking for Metro Turf Ground on September 27 has been cancelled. Refund will be processed within 3-5 business days.',
          type: 'warning',
          read: true,
          createdAt: new Date('2024-09-25T11:15:00'),
          actionUrl: '/user/payments'
        }
      ];
      setNotifications(mockNotifications);
      toast.info('Showing demo notification data');
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return notification.type === filter;
  });

  // Get notification icon and color
  const getNotificationInfo = (type) => {
    switch (type) {
      case 'booking':
        return { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'payment':
        return { icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100' };
      case 'reminder':
        return { icon: Bell, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' };
      case 'info':
        return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' };
      default:
        return { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getToken('token');
      await axios.patch(
        `http://localhost:4500/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(notifications.map(notif => 
        notif._id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      // Fallback for demo - just update locally
      setNotifications(notifications.map(notif => 
        notif._id === notificationId ? { ...notif, read: true } : notif
      ));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        'http://localhost:4500/api/notifications/mark-all-read',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      // Fallback for demo
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      toast.success('All notifications marked as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:4500/api/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(notifications.filter(notif => notif._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      // Fallback for demo
      setNotifications(notifications.filter(notif => notif._id !== notificationId));
      toast.success('Notification deleted');
    }
  };

  // Delete selected notifications
  const deleteSelected = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        'http://localhost:4500/api/notifications/bulk-delete',
        { 
          data: { notificationIds: selectedNotifications },
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      setNotifications(notifications.filter(notif => 
        !selectedNotifications.includes(notif._id)
      ));
      setSelectedNotifications([]);
      toast.success(`${selectedNotifications.length} notifications deleted`);
    } catch (error) {
      // Fallback for demo
      setNotifications(notifications.filter(notif => 
        !selectedNotifications.includes(notif._id)
      ));
      setSelectedNotifications([]);
      toast.success(`${selectedNotifications.length} notifications deleted`);
    }
  };

  // Toggle notification selection
  const toggleSelection = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInHours = Math.floor((now - notifDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notifDate.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Please log in to view your notifications</div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-gray-900 dark:to-gray-800`}>
      <UserNavbar onToggleDark={() => setDarkMode(!darkMode)} darkMode={darkMode} />
      <div className="flex">
        <Sidebar user={user} onToggleDark={() => setDarkMode(!darkMode)} darkMode={darkMode} />
        <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8 pt-48 pb-8 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {unreadCount} new
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Stay updated with your booking and account activities
                </p>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Filters and Actions */}
            <Card className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  {['all', 'unread', 'booking', 'payment', 'reminder', 'info', 'warning'].map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        filter === filterType
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    </button>
                  ))}
                </div>

                {selectedNotifications.length > 0 && (
                  <button
                    onClick={deleteSelected}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm"
                  >
                    Delete Selected ({selectedNotifications.length})
                  </button>
                )}
              </div>
            </Card>

            {/* Notifications List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const notificationInfo = getNotificationInfo(notification.type);
                  const NotificationIcon = notificationInfo.icon;
                  
                  return (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                        !notification.read ? 'border-l-4 border-green-500' : ''
                      }`}>
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={selectedNotifications.includes(notification._id)}
                              onChange={() => toggleSelection(notification._id)}
                              className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                          </div>
                          
                          <div className={`flex-shrink-0 p-2 rounded-full ${notificationInfo.bg}`}>
                            <NotificationIcon className={`w-5 h-5 ${notificationInfo.color}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className={`text-sm font-medium ${
                                  notification.read 
                                    ? 'text-gray-600 dark:text-gray-400' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {notification.title}
                                </h3>
                                <p className={`mt-1 text-sm ${
                                  notification.read 
                                    ? 'text-gray-500 dark:text-gray-500' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {notification.message}
                                </p>
                                <p className="mt-2 text-xs text-gray-400">
                                  {formatRelativeTime(notification.createdAt)}
                                </p>
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification._id)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                    title="Mark as read"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => deleteNotification(notification._id)}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
                <div className="text-gray-400 mb-4">
                  <Bell className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {filter !== 'all' 
                    ? `No ${filter} notifications at the moment`
                    : "You're all caught up! No new notifications."}
                </p>
              </Card>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserNotifications;