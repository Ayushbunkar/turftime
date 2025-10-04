import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Navbar from "../../../components/layout/Navbar.jsx";
import { Card } from "../../../components/ui/Card.jsx";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import toast from "react-hot-toast";
import axios from "axios";

function EditProfileModal({ open, onClose, user, token, onProfileUpdate }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setError("");
  }, [user, open]);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.patch(
        "http://localhost:4500/api/users/me", // <-- use full backend URL
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onProfileUpdate(res.data.user);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
        <div className="mb-3">
          <label className="block text-sm mb-1">Name</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { user, login } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [editOpen, setEditOpen] = useState(false);



  // WebSocket for real-time booking updates (disabled, backend not implemented)
  // useEffect(() => {
  //   wsRef.current = new WebSocket("ws://localhost:4500/realtime");
  //   wsRef.current.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       if (data.type === "NEW_BOOKING") {
  //         setBookings((prev) => [data.booking, ...prev]);
  //       }
  //     } catch {}
  //   };
  //   return () => wsRef.current.close();
  // }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Please log in to view your dashboard</div>
      </div>
    );
  }

  // Add this function to update user in context and localStorage
  const handleProfileUpdate = (updatedUser) => {
    login(updatedUser); // update context
    localStorage.setItem("user", JSON.stringify(updatedUser));
    toast.success("Profile updated!");
  };

  const token = localStorage.getItem('token');

  // Place this just before your main return statement in UserDashboard
  return (
    <>
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        token={token}
        onProfileUpdate={handleProfileUpdate}
      />
      <div
        className={`${
          darkMode ? "dark" : ""
        } min-h-screen  bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-gray-900 dark:to-gray-800`}
      >
        <Navbar user={user} onToggleDark={() => setDarkMode(!darkMode)} />
        <div className="flex">
          <Sidebar user={user} onToggleDark={() => setDarkMode(!darkMode)} darkMode={darkMode} />
          <main className="flex-1 ml-64 p-4 mt-20 sm:p-8 space-y-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-md mx-auto mb-8"
            >
              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
                <div className="w-16 h-16 rounded-full bg-green-500 text-white mx-auto flex items-center justify-center text-2xl mb-4 font-semibold">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-gray-500">{user.email}</p>
              </Card>
            </motion.div>

            {/* Dashboard Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">0</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Total Bookings</div>
              </Card>
              
              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Upcoming Games</div>
              </Card>
              
              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">₹0</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Total Spent</div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="max-w-4xl mx-auto">
              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/turfs"
                    className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Book New Turf
                  </Link>
                  <Link
                    to="/user/bookings"
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    View My Bookings
                  </Link>
                  <Link
                    to="/user/profile"
                    className="flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Manage Profile
                  </Link>
                </div>
              </Card>
            </div>


          </main>
        </div>
      </div>
    </>
  );
}
