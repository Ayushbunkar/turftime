import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Turfs from "./pages/Turfs";
import TurfDetail from "./pages/TurfDetail";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import DashboardRouter from "./components/routing/DashboardRouter";

import UserDashboard from "./pages/DashBoards/User/UserDashboard";
import UserBookings from "./pages/DashBoards/User/UserBookings";
import UserProfile from "./pages/DashBoards/User/UserProfile";
import UserPayments from "./pages/DashBoards/User/UserPayments";
import UserNotifications from "./pages/DashBoards/User/UserNotifications";
import UserSettings from "./pages/DashBoards/User/UserSettings";
import UserHelp from "./pages/DashBoards/User/UserHelp";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";
import { Toaster } from "react-hot-toast";
import Test from "./pages/Location";
import TurfAdminDashboard from "./pages/DashBoards/TurfAdmin/TurfAdminDashboard.jsx";
import SuperAdminDashboard from "./pages/DashBoards/SuperAdmin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/DashBoards/SuperAdmin/SuperAdminUsers";
import SuperAdminBookingManagement from "./pages/DashBoards/SuperAdmin/SuperAdminBookingManagement";
import TurfAdminManagement from "./pages/DashBoards/TurfAdmin/TurfAdminManagement.jsx";
import SuperAdminAnalytics from "./pages/DashBoards/SuperAdmin/SuperAdminAnalytics";
import SuperAdminSettings from "./pages/DashBoards/SuperAdmin/SuperAdminSettings";
import SuperAdminTurfAdmins from "./pages/DashBoards/SuperAdmin/SuperAdminTurfAdmins";
import SuperAdminTurfs from "./pages/DashBoards/SuperAdmin/SuperAdminTurfsandVenues.jsx";
import SuperAdminRevenue from "./pages/DashBoards/SuperAdmin/SuperAdminRevenue";
import SuperAdminSystemHealth from "./pages/DashBoards/SuperAdmin/SuperAdminSystemHealth";
import SuperAdminNotifications from "./pages/DashBoards/SuperAdmin/SuperAdminNotifications";
import SuperAdminDatabase from "./pages/DashBoards/SuperAdmin/SuperAdminDatabase";
import SuperAdminEmails from "./pages/DashBoards/SuperAdmin/SuperAdminEmails";
import SuperAdminSupport from "./pages/DashBoards/SuperAdmin/SuperAdminSupport";
import TurfAdminHome from "./pages/DashBoards/TurfAdmin/TurfAdminHome.jsx";
import TurfAdminTurfs from "./pages/DashBoards/TurfAdmin/TurfAdminTurfs.jsx";
import TurfAdminBookings from "./pages/DashBoards/TurfAdmin/TurfAdminBookings.jsx";
import TurfAdminAnalytics from "./pages/DashBoards/TurfAdmin/TurfAdminAnalytics.jsx";
import TurfAdminProfile from "./pages/DashBoards/TurfAdmin/TurfAdminProfile.jsx";
import TurfAdminSettings from "./pages/DashBoards/TurfAdmin/TurfAdminSettings.jsx";
import TurfAdminNotifications from "./pages/DashBoards/TurfAdmin/TurfAdminNotifications.jsx";
import TurfAdminHelp from "./pages/DashBoards/TurfAdmin/TurfAdminHelp.jsx";
import Payment from "./pages/Payment.jsx";
import { useAuth } from "./context/AuthContext";

// Conditional Footer component
function ConditionalFooter() {
  const location = useLocation();
  
  // Hide footer on all dashboard routes
  const dashboardRoutes = [
    '/user-dashboard', 
    '/user', 
    '/admin', 
    '/super-admin',
    '/turfadmin'
  ];
  const shouldHideFooter = dashboardRoutes.some(route => 
    location.pathname.startsWith(route)
  );
  
  return shouldHideFooter ? null : <Footer />;
}



// Import invisible auth cleanup utilities
import TokenCleaner from "./components/utils/TokenCleaner";
import { runAutoAuthCleanup } from "./utils/autoAuthCleanup";

function AppRoutes() {
  // Run automatic auth cleanup on app start
  React.useEffect(() => {
    runAutoAuthCleanup();
  }, []);

  return (
    <Router>
      <Navbar />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Toaster position="top-right" reverseOrder={false} />
        <TokenCleaner />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/turfs" element={<Turfs />} />
            <Route path="/turfs/:id" element={<TurfDetail />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/my-bookings" element={<ProtectedRoute element={<MyBookings />} />} />
            
            {/* Dashboard route that redirects based on user role */}
            <Route path="/dashboard" element={<DashboardRouter />} />
          
            
            {/* User Dashboard Routes */}
            <Route 
              path="/user-dashboard" 
              element={<ProtectedRoute element={<UserDashboard />} requiredRole="user" />} 
            />
            <Route 
              path="/user/bookings" 
              element={<ProtectedRoute element={<UserBookings />} requiredRole="user" />} 
            />
            <Route 
              path="/user/profile" 
              element={<ProtectedRoute element={<UserProfile />} requiredRole="user" />} 
            />
            <Route 
              path="/user/payments" 
              element={<ProtectedRoute element={<UserPayments />} requiredRole="user" />} 
            />
            <Route 
              path="/user/notifications" 
              element={<ProtectedRoute element={<UserNotifications />} requiredRole="user" />} 
            />
            <Route 
              path="/user/settings" 
              element={<ProtectedRoute element={<UserSettings />} requiredRole="user" />} 
            />
            <Route 
              path="/user/help" 
              element={<ProtectedRoute element={<UserHelp />} requiredRole="user" />} 
            />
            <Route path="/Location" element={<Test />} />

            {/* Super Admin Dashboard Routes */}
            <Route 
              path="/super-admin/dashboard" 
              element={<ProtectedRoute element={<SuperAdminDashboard />} allowedRoles={["admin", "superadmin"]} />} 
            />
            <Route 
              path="/super-admin/users" 
              element={<ProtectedRoute element={<SuperAdminUsers />} allowedRoles={["admin", "superadmin"]} />} 
            />
            <Route 
              path="/super-admin/turf-admins" 
              element={<ProtectedRoute element={<SuperAdminTurfAdmins />} allowedRoles={["admin", "superadmin"]} />} 
            />
            <Route 
              path="/super-admin/turfs" 
              element={<ProtectedRoute element={<SuperAdminTurfs />} allowedRoles={["admin", "superadmin"]} />} 
            />
            <Route 
              path="/super-admin/bookings" 
              element={<ProtectedRoute element={<SuperAdminBookingManagement />} allowedRoles={["admin", "superadmin"]} />} 
            />
            <Route 
              path="/super-admin/analytics" 
              element={<ProtectedRoute element={<SuperAdminAnalytics />} allowedRoles={["admin", "superadmin"]} />} 
            />
            <Route 
              path="/super-admin/revenue" 
              element={<ProtectedRoute element={<SuperAdminRevenue />} allowedRoles={["admin", "superadmin"]} />} 
            />
            <Route 
              path="/super-admin/notifications" 
              element={<ProtectedRoute element={<SuperAdminNotifications />} allowedRoles={["admin", "superadmin"]} />} 
            />
            <Route 
              path="/super-admin/database" 
              element={<ProtectedRoute element={<SuperAdminDatabase />} allowedRoles={["admin", "superadmin"]} />} 
            />
            <Route 
              path="/super-admin/system-health" 
              element={<ProtectedRoute element={<SuperAdminSystemHealth />} allowedRoles={["admin", "superadmin"]} />} 
            />
            <Route 
              path="/super-admin/emails" 
              element={<ProtectedRoute element={<SuperAdminEmails />} allowedRoles={["admin", "superadmin"]} />} 
            />
            <Route 
              path="/super-admin/support" 
              element={<ProtectedRoute element={<SuperAdminSupport />} allowedRoles={["admin", "superadmin"]} />} 
            />
            <Route 
              path="/super-admin/settings" 
              element={<ProtectedRoute element={<SuperAdminSettings />} allowedRoles={["admin", "superadmin"]} />} 
            />
            
            {/* Legacy Admin Dashboard Routes - redirect to super-admin */}
            <Route path="/admin" element={<Navigate to="/super-admin/dashboard" />} />
            <Route path="/admin/*" element={<Navigate to="/super-admin/dashboard" />} />

            {/* Turf Admin Dashboard Nested Routes */}
            <Route path="/turfadmin" element={<ProtectedRoute element={<TurfAdminDashboard />} requiredRole="turfadmin" />}>
              <Route index element={<TurfAdminHome />} />
              <Route path="turfs" element={<TurfAdminTurfs />} />
              <Route path="bookings" element={<TurfAdminBookings />} />
              <Route path="analytics" element={<TurfAdminAnalytics />} />
              <Route path="revenue" element={<TurfAdminAnalytics />} />
              <Route path="profile" element={<TurfAdminProfile />} />
              <Route path="notifications" element={<TurfAdminNotifications />} />
              <Route path="settings" element={<TurfAdminSettings />} />
              <Route path="help" element={<TurfAdminHelp />} />
            </Route>

            {/* Must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <ConditionalFooter />
      </div>
    </Router>
  );
}

function App() { return <AppRoutes />; }

export default App;
