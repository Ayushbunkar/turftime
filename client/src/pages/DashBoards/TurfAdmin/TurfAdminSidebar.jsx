import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Flag, 
  Calendar, 
  BarChart3, 
  User, 
  Settings, 
  LogOut,
  HelpCircle,
  Bell,
  Moon,
  Sun
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const TurfAdminSidebar = ({ onToggleDark, darkMode = false }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/turfadmin',
      active: location.pathname === '/turfadmin'
    },
    { 
      icon: Flag, 
      label: 'My Turfs', 
      path: '/turfadmin/turfs',
      active: location.pathname === '/turfadmin/turfs'
    },
    { 
      icon: Calendar, 
      label: 'Bookings', 
      path: '/turfadmin/bookings',
      active: location.pathname === '/turfadmin/bookings'
    },
    { 
      icon: BarChart3, 
      label: 'Analytics & Revenue', 
      path: '/turfadmin/analytics',
      active: location.pathname === '/turfadmin/analytics'
    },
    { 
      icon: User, 
      label: 'Profile', 
      path: '/turfadmin/profile',
      active: location.pathname === '/turfadmin/profile'
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      path: '/turfadmin/notifications',
      active: location.pathname === '/turfadmin/notifications'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/turfadmin/settings',
      active: location.pathname === '/turfadmin/settings'
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      path: '/turfadmin/help',
      active: location.pathname === '/turfadmin/help'
    }
  ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  return (
    <motion.aside 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center mt-10 justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-semibold">
            {user?.name ? user.name[0].toUpperCase() : 'T'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {user?.name || 'Turf Admin'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Administrator
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Scrollable */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0 sidebar-nav">
        <style>{`
          .sidebar-nav::-webkit-scrollbar {
            width: 6px;
          }
          .sidebar-nav::-webkit-scrollbar-track {
            background: transparent;
          }
          .sidebar-nav::-webkit-scrollbar-thumb {
            background-color: #d1d5db;
            border-radius: 3px;
          }
          .sidebar-nav::-webkit-scrollbar-thumb:hover {
            background-color: #9ca3af;
          }
          .dark .sidebar-nav::-webkit-scrollbar-thumb {
            background-color: #4b5563;
          }
          .dark .sidebar-nav::-webkit-scrollbar-thumb:hover {
            background-color: #6b7280;
          }
        `}</style>
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

      {/* Bottom Actions - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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

export default TurfAdminSidebar;

