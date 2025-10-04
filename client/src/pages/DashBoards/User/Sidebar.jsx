import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Settings, 
  LogOut, 
  Home,
  CreditCard,
  Bell,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ user, onToggleDark, darkMode = false }) => {
  const location = useLocation();
  
  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/user-dashboard',
      active: location.pathname === '/user-dashboard'
    },
    { 
      icon: Calendar, 
      label: 'My Bookings', 
      path: '/user/bookings',
      active: location.pathname === '/user/bookings'
    },
    { 
      icon: CreditCard, 
      label: 'Payment History', 
      path: '/user/payments',
      active: location.pathname === '/user/payments'
    },
    { 
      icon: User, 
      label: 'Profile', 
      path: '/user/profile',
      active: location.pathname === '/user/profile'
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      path: '/user/notifications',
      active: location.pathname === '/user/notifications'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/user/settings',
      active: location.pathname === '/user/settings'
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      path: '/user/help',
      active: location.pathname === '/user/help'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <motion.aside 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center mt-10 justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-semibold">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {user?.name || 'User'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                item.active
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-r-2 border-green-500'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDark}
          className="flex items-center space-x-3 w-full px-4 py-3 mb-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="font-medium">
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;