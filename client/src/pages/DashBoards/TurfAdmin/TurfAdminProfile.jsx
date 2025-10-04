import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { useAuth } from "../../../context/AuthContext";
import { useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera
} from "lucide-react";

export default function TurfAdminProfile() {
  const { user, login } = useAuth();
  const { darkMode } = useOutletContext() || {};
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        businessName: user.businessName || "",
        description: user.description || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.patch("/turfadmin/profile", formData);
      const updatedUser = response.data.user || response.data;
      
      // Update user in context and localStorage
      login(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      businessName: user?.businessName || "",
      description: user?.description || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account information and business details
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "T"}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || "Turf Admin"}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{user?.email || "admin@example.com"}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Turf Administrator
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+91 9876543210"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{user?.phone || "Not provided"}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Business address"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{user?.address || "Not provided"}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Business Information */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Information</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Your business name"
                />
              ) : (
                <p className="text-gray-900 dark:text-white p-2">{user?.businessName || "Not provided"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Description
              </label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe your business..."
                />
              ) : (
                <p className="text-gray-900 dark:text-white p-2">{user?.description || "No description provided"}</p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Account Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">3</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Turfs</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">156</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹45,000</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}