// src/pages/TurfAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TurfAdminSidebar from "./TurfAdminSidebar";
import TurfAdminNavbar from "./TurfAdminNavbar";
import api from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

export default function TurfAdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, token } = useAuth();
  const location = useLocation();
  
  console.log("Current location:", location.pathname);
  console.log("Current user:", user);
  
  // Set up axios defaults with authentication
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/turfadmin/dashboard");
      setDashboardData(res.data);
    } catch (apiError) {
      console.error("API error:", apiError);
      setDashboardData(null);
      
      // Only show specific error messages, not generic ones
      if (apiError.response?.status === 403) {
        toast.error("Access denied. Please contact administrator.");
      } else if (apiError.response?.status !== 401) {
        // Don't show error for 401 (handled by auth)
        const errorMsg = apiError.response?.data?.message || "Failed to load dashboard";
        if (!errorMsg.includes("role")) {
          toast.error(errorMsg);
        }
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-gray-900 dark:to-gray-800`}>
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      <TurfAdminNavbar 
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onToggleDark={() => setDarkMode(!darkMode)} 
        darkMode={darkMode}
      />
      <div className="flex">
        <TurfAdminSidebar 
          onToggleDark={() => setDarkMode(!darkMode)} 
          darkMode={darkMode}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8 pt-48 pb-8 min-h-screen">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <Outlet context={{ refreshData: fetchDashboardData, dashboardData, darkMode }} />
          )}
        </main>
      </div>
    </div>
  );
}
