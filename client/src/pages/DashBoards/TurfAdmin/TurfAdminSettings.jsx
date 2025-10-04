import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { useAuth } from "../../../context/AuthContext";
import { useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Globe,
  Moon,
  Sun,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Download,
  Building2
} from "lucide-react";

export default function TurfAdminSettings() {
  const { user } = useAuth();
  const { darkMode } = useOutletContext() || {};
  const [settings, setSettings] = useState({
    notifications: {
      emailBookings: true,
      emailCancellations: true,
      emailPayments: true,
      smsReminders: false,
      pushNotifications: true
    },
    privacy: {
      profileVisibility: 'public',
      showBusinessInfo: true,
      showContactInfo: true
    },
    business: {
      autoConfirmBookings: false,
      cancellationPolicy: '24',
      refundPolicy: 'partial',
      operatingHours: {
        start: '06:00',
        end: '23:00'
      }
    },
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 30
    }
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('notifications');
  const [activeTab, setActiveTab] = useState('notifications');

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'business', label: 'Business Settings', icon: SettingsIcon },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'data', label: 'Data Management', icon: Database }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/turfadmin/settings');
      setSettings(prev => ({ ...prev, ...response.data.settings }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use default settings if fetch fails
    }
  };

  const updateSettings = async (section, updatedData) => {
    setLoading(true);
    try {
      await api.patch('/turfadmin/settings', {
        section,
        settings: updatedData
      });
      setSettings(prev => ({
        ...prev,
        [section]: { ...prev[section], ...updatedData }
      }));
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/turfadmin/change-password', {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await api.get('/turfadmin/export-data');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `turfadmin-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const deleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/turfadmin/account');
        toast.success('Account deleted successfully');
        // Logout user
        localStorage.clear();
        window.location.href = '/login';
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
      }
    }
  };

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
      
      <div className="space-y-4">
        {Object.entries(settings.notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {key === 'emailBookings' && 'Email for New Bookings'}
                {key === 'emailCancellations' && 'Email for Cancellations'}
                {key === 'emailPayments' && 'Email for Payments'}
                {key === 'smsReminders' && 'SMS Reminders'}
                {key === 'pushNotifications' && 'Push Notifications'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {key === 'emailBookings' && 'Get notified when someone books your turf'}
                {key === 'emailCancellations' && 'Get notified when bookings are cancelled'}
                {key === 'emailPayments' && 'Get notified about payment updates'}
                {key === 'smsReminders' && 'Receive SMS for important updates'}
                {key === 'pushNotifications' && 'Receive browser push notifications'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => updateSettings('notifications', { [key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Auto-Confirm Bookings
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.business.autoConfirmBookings}
              onChange={(e) => updateSettings('business', { autoConfirmBookings: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Automatically confirm new bookings without manual review
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cancellation Policy (Hours)
          </label>
          <select
            value={settings.business.cancellationPolicy}
            onChange={(e) => updateSettings('business', { cancellationPolicy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="1">1 Hour</option>
            <option value="2">2 Hours</option>
            <option value="6">6 Hours</option>
            <option value="12">12 Hours</option>
            <option value="24">24 Hours</option>
            <option value="48">48 Hours</option>
          </select>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Operating Hours Start
          </label>
          <input
            type="time"
            value={settings.business.operatingHours.start}
            onChange={(e) => updateSettings('business', { 
              operatingHours: { ...settings.business.operatingHours, start: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Operating Hours End
          </label>
          <input
            type="time"
            value={settings.business.operatingHours.end}
            onChange={(e) => updateSettings('business', { 
              operatingHours: { ...settings.business.operatingHours, end: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h3>
      
      {/* Password Change Form */}
      <form onSubmit={handlePasswordChange} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Change Password</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>

      {/* Security Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Login Notifications</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified of new login attempts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.loginNotifications}
              onChange={(e) => updateSettings('security', { loginNotifications: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Management</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Export Your Data</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
            Download all your data including turfs, bookings, and analytics
          </p>
          <button
            onClick={exportData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h4 className="font-medium text-red-900 dark:text-red-300 mb-2">Delete Account</h4>
          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={deleteAccount}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'business', label: 'Business', icon: Building2 },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'data', label: 'Data', icon: Database }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === id
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'notifications' && renderNotificationSettings()}
              {activeTab === 'business' && renderBusinessSettings()}
              {activeTab === 'security' && renderSecuritySettings()}
              {activeTab === 'data' && renderDataManagement()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}