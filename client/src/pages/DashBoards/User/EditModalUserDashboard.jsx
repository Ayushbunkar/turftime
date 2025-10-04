import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

export default function EditModalUserDashboard({ isOpen, onClose, onUpdate }) {
  const { user, token, login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form data when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user?.name || "",
        email: user?.email || ""
      });
      setErrors({});
      setTouched({});
    }
  }, [user, isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle input blur for validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, formData[name]);
  };

  // Field validation
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Name is required";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return !error;
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true
    });

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await axios.patch(
        "http://localhost:4500/api/users/me",
        { 
          name: formData.name.trim(),
          email: formData.email.trim()
        },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        }
      );

      // Update auth context
      login(res.data.user);
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate(res.data.user);
      }

      toast.success("Profile updated successfully!");
      
      // Close modal after successful update
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (err) {
      console.error("Update error:", err);
      
      let errorMessage = "Update failed. Please try again.";
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 400) {
          errorMessage = err.response.data?.message || "Invalid data provided";
        } else if (err.response.status === 401) {
          errorMessage = "Session expired. Please login again.";
        } else if (err.response.status === 409) {
          errorMessage = "Email already exists. Please use a different email.";
        } else {
          errorMessage = err.response.data?.message || err.response.data?.error || errorMessage;
        }
      } else if (err.request) {
        // Request made but no response received
        errorMessage = "Network error. Please check your connection.";
      }

      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking on backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name && touched.name 
                    ? "border-red-300 bg-red-50" 
                    : "border-gray-300"
                } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="Enter your name"
              />
              {errors.name && touched.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email && touched.email 
                    ? "border-red-300 bg-red-50" 
                    : "border-gray-300"
                } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="Enter your email"
              />
              {errors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}