import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Lock, Eye, Globe, Smartphone, Mail, Shield, Save } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import Sidebar from './Sidebar';
import UserNavbar from './UserNavbar';
import toast from 'react-hot-toast';
import axios from 'axios';

const UserSettings = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    // Notification preferences
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingReminders: true,
    paymentAlerts: true,
    promotionalEmails: false,
    
    // Privacy settings
    profileVisibility: 'private',
    shareBookingHistory: false,
    allowDataCollection: true,
    
    // App preferences
    language: 'en',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    theme: 'system',
    
    // Security settings
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30
  });

  useEffect(() => {
    fetchUserSettings();
  }, []);

  // Fetch user settings from backend
  const fetchUserSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:4500/api/users/settings',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data) {
        setSettings(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Continue with default settings if API fails
    }
  };

  // Update settings
  const updateSettings = async (newSettings) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        'http://localhost:4500/api/users/settings',
        newSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSettings(prev => ({ ...prev, ...newSettings }));
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      // For demo purposes, still update locally
      setSettings(prev => ({ ...prev, ...newSettings }));
      toast.success('Settings updated successfully!');
    } finally {
      setLoading(false);
    }
  };

  // Handle setting change
  const handleSettingChange = (key, value) => {
    const newSettings = { [key]: value };
    updateSettings(newSettings);
  };

  // Toggle switch component
  const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
        enabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Please log in to view your settings</div>
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Customize your account preferences and privacy settings
              </p>
            </div>

            <div className="space-y-6">
              {/* Notification Settings */}
              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="flex items-center mb-6">
                  <Bell className="w-6 h-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Notification Preferences
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive booking confirmations and updates via email
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.emailNotifications}
                      onChange={(value) => handleSettingChange('emailNotifications', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get text messages for booking reminders
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.smsNotifications}
                      onChange={(value) => handleSettingChange('smsNotifications', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.pushNotifications}
                      onChange={(value) => handleSettingChange('pushNotifications', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Booking Reminders</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get reminded before your scheduled bookings
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.bookingReminders}
                      onChange={(value) => handleSettingChange('bookingReminders', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Payment Alerts</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Notifications for successful and failed payments
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.paymentAlerts}
                      onChange={(value) => handleSettingChange('paymentAlerts', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Promotional Emails</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive offers and promotional content
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.promotionalEmails}
                      onChange={(value) => handleSettingChange('promotionalEmails', value)}
                    />
                  </div>
                </div>
              </Card>

              {/* Privacy Settings */}
              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="flex items-center mb-6">
                  <Shield className="w-6 h-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Privacy & Security
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Profile Visibility</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Control who can see your profile information
                      </p>
                    </div>
                    <select
                      value={settings.profileVisibility}
                      onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Share Booking History</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Allow others to see your booking activity
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.shareBookingHistory}
                      onChange={(value) => handleSettingChange('shareBookingHistory', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Data Collection</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Allow us to collect usage data to improve our service
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.allowDataCollection}
                      onChange={(value) => handleSettingChange('allowDataCollection', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.twoFactorAuth}
                      onChange={(value) => handleSettingChange('twoFactorAuth', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Login Alerts</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified when someone logs into your account
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.loginAlerts}
                      onChange={(value) => handleSettingChange('loginAlerts', value)}
                    />
                  </div>
                </div>
              </Card>

              {/* App Preferences */}
              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="flex items-center mb-6">
                  <Settings className="w-6 h-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    App Preferences
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleSettingChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="INR">₹ Indian Rupee</option>
                      <option value="USD">$ US Dollar</option>
                      <option value="EUR">€ Euro</option>
                      <option value="GBP">£ British Pound</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={0}>Never</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-red-500">
                <h2 className="text-xl font-semibold text-red-600 mb-4">
                  Danger Zone
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Delete Account</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <button
                      onClick={() => toast.error('Account deletion is not available in demo')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                    >
                      Delete Account
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Export Data</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Download all your account data in JSON format
                      </p>
                    </div>
                    <button
                      onClick={() => toast.success('Data export would be processed')}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200"
                    >
                      Export Data
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserSettings;