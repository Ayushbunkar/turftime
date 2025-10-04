import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import axios from "axios";
import toast from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:4500/api/auth/signup", formData, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center mb-6">
              Create an <span className="text-green-600">Account</span>
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Create a password"
                  required
                />
              </div>
              <div className="mb-4">
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md shadow transition"
                  style={{ marginTop: "0.5rem" }}
                >
                  {loading ? "Creating..." : "Register"}
                </Button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
