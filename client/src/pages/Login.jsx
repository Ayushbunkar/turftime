import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call AuthContext login method
      const user = await login(email, password);
      setIsLoading(false);

      // Get role safely (default to "user")
      const userRole = user?.role?.toLowerCase() || "user";

      // Role → Route mapping
      const roleRoutes = {
        superadmin: "/super-admin/dashboard",
        admin: "/super-admin/dashboard",
        turfadmin: "/turfadmin",
        user: "/user-dashboard",
      };

      // Navigate to matched role route (default → user-dashboard)
      navigate(roleRoutes[userRole] || "/user-dashboard", { replace: true });
    } catch (error) {
      setIsLoading(false);
      console.error("Login error:", error);

      // Optional: show toast here if AuthContext doesn’t handle it
      // toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-lg p-8"
      >
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Turf Time
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signup"
              className="font-medium text-green-600 hover:text-green-500 transition"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 shadow-md hover:shadow-lg transition-all"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
