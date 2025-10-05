import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Shield,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building,
  Activity,
  DollarSign,
  Database,
  Mail,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const SuperAdminSidebar = ({ isMobileOpen = false, onMobileClose = () => {} }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/super-admin/dashboard", description: "Overview & Analytics" },
    { title: "User Management", icon: Users, path: "/super-admin/users", description: "Manage all users" },
    { title: "Turf Admin Management", icon: Shield, path: "/super-admin/turf-admins", description: "Manage turf administrators" },
    { title: "Turfs & Venues", icon: Building, path: "/super-admin/turfs", description: "Manage all turfs" },
    { title: "Bookings", icon: UserCheck, path: "/super-admin/bookings", description: "Monitor all bookings" },
    { title: "Analytics & Reports", icon: BarChart3, path: "/super-admin/analytics", description: "System analytics" },
    { title: "Revenue Management", icon: DollarSign, path: "/super-admin/revenue", description: "Financial overview" },
    { title: "System Health", icon: Activity, path: "/super-admin/system-health", description: "Monitor system status" },
    { title: "Notifications", icon: Bell, path: "/super-admin/notifications", description: "System alerts" },
    { title: "Database Management", icon: Database, path: "/super-admin/database", description: "Database operations" },
    { title: "Email Management", icon: Mail, path: "/super-admin/emails", description: "Email campaigns" },
    { title: "Support & Tickets", icon: HelpCircle, path: "/super-admin/support", description: "Customer support" },
    { title: "Settings", icon: Settings, path: "/super-admin/settings", description: "System configuration" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarVariants = {
    expanded: { width: "320px" },
    collapsed: { width: "80px" },
  };

  const itemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 },
  };

  return (
    <motion.div
      variants={sidebarVariants}
      animate={{ width: collapsed ? "80px" : "320px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white
        fixed left-0 top-36 z-40 shadow-2xl
        flex flex-col overflow-hidden min-h-0
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:block h-[calc(100vh-9rem)] max-h-[calc(100vh-9rem)]`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex-none">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Super Admin</h1>
                  <p className="text-xs text-slate-400">TurfOwn Platform</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-700 flex-none">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {user?.name?.charAt(0) || "S"}
            </span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                variants={itemVariants}
                animate={collapsed ? "collapsed" : "expanded"}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || "Super Admin"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || "admin@turfown.com"}
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scrollable Navigation */}
      <nav
        className="flex-1 overflow-y-auto py-4 super-admin-nav min-h-0"
        style={{ maxHeight: 'calc(100vh - 9rem)', WebkitOverflowScrolling: 'touch', touchAction: 'auto' }}
      >
        <style>{`
          .super-admin-nav {
            scrollbar-width: thin;
            scrollbar-color: #64748b rgba(30, 41, 59, 0.3);
            scroll-behavior: smooth;
          }
          .super-admin-nav::-webkit-scrollbar {
            width: 6px;
          }
          .super-admin-nav::-webkit-scrollbar-track {
            background: transparent;
          }
          .super-admin-nav::-webkit-scrollbar-thumb {
            background-color: #64748b;
            border-radius: 3px;
            opacity: 0;
          }
          .super-admin-nav:hover::-webkit-scrollbar-thumb {
            opacity: 1;
          }
        `}</style>

        <div className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      variants={itemVariants}
                      animate={collapsed ? "collapsed" : "expanded"}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 truncate">{item.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {collapsed && (
                  <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    {item.title}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-slate-700 flex-none">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              variants={itemVariants}
              animate={collapsed ? "collapsed" : "expanded"}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">System Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  <span className="text-green-400">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Server Load</span>
                <span className="text-slate-300">23%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Users</span>
                <span className="text-slate-300">1,247</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700 flex-none">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                variants={itemVariants}
                animate={collapsed ? "collapsed" : "expanded"}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>

          {collapsed && (
            <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default SuperAdminSidebar;
