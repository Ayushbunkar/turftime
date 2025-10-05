import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Star,
  MapPin
} from "lucide-react";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminNavbar from "./SuperAdminNavbar";
import superAdminService from "../../../services/superAdminService";
import toast from "react-hot-toast";

const SuperAdminDashboard = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTurfs: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
    turfAdmins: 0,
    pendingApprovals: 0,
    systemHealth: 100
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    serverLoad: 0,
    memoryUsage: 0,
    responseTime: 0,
    activeConnections: 0,
    errorRate: 0,
    uptime: 0
  });
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    bookingTrends: [],
    popularTurfs: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, activitiesData, metricsData, analyticsDataRes] = await Promise.all([
        superAdminService.getDashboardStats(),
        superAdminService.getRecentActivities(10),
        superAdminService.getSystemMetrics(),
        superAdminService.getAnalyticsData("7d")
      ]);

      if (statsData) setStats(statsData);
      if (activitiesData?.activities) setRecentActivities(activitiesData.activities);
      if (metricsData) setSystemMetrics(metricsData);
      if (analyticsDataRes) setAnalyticsData(analyticsDataRes);

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  const formatCurrency = (amount) => {
    return superAdminService.formatCurrency(amount);
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers?.toLocaleString() || "0",
      change: "+12.5%",
      changeType: "increase",
      icon: Users,
      color: "blue",
      description: `${stats.activeUsers || 0} active today`
    },
    {
      title: "Total Turfs",
      value: stats.totalTurfs?.toLocaleString() || "0",
      change: "+8.2%",
      changeType: "increase",
      icon: Building,
      color: "green",
      description: "Across all locations"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings?.toLocaleString() || "0",
      change: "+15.3%",
      changeType: "increase",
      icon: Calendar,
      color: "purple",
      description: "This month"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue || 0),
      change: "+18.7%",
      changeType: "increase",
      icon: DollarSign,
      color: "orange",
      description: `${formatCurrency(stats.monthlyRevenue || 0)} this month`
    },
    {
      title: "Turf Admins",
      value: stats.turfAdmins?.toLocaleString() || "0",
      change: "+3",
      changeType: "increase",
      icon: Shield,
      color: "indigo",
      description: `${stats.pendingApprovals || 0} pending approval`
    },
    {
      title: "System Health",
      value: `${stats.systemHealth}%`,
      change: "Excellent",
      changeType: "neutral",
      icon: Activity,
      color: "emerald",
      description: "All systems operational"
    }
  ];

  const getIconColor = (color) => {
    const colors = {
      blue: "text-blue-600 bg-blue-100",
      green: "text-green-600 bg-green-100",
      purple: "text-purple-600 bg-purple-100",
      orange: "text-orange-600 bg-orange-100",
      indigo: "text-indigo-600 bg-indigo-100",
      emerald: "text-emerald-600 bg-emerald-100"
    };
    return colors[color] || colors.blue;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "user": return <Users className="w-4 h-4 text-blue-500" />;
      case "booking": return <Calendar className="w-4 h-4 text-green-500" />;
      case "admin": return <Shield className="w-4 h-4 text-purple-500" />;
      case "payment": return <DollarSign className="w-4 h-4 text-orange-500" />;
      case "system": return <Activity className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-50 h-auto ">
      {/* Fixed Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <SuperAdminNavbar onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      </div>

      {/* Sidebar */}
      <SuperAdminSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Page Content */}
      <div className="flex pt-[9rem]"> {/* 9rem accounts for both navbars */}
        {/* Sidebar spacing (width same as sidebar) */}
        <div className="hidden lg:block w-[320px]" />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Last updated: {superAdminService.formatDate(lastUpdated, {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <div
                  className={`w-3 h-3 rounded-full ${
                    systemMetrics.uptime > 95 ? "bg-green-400" : "bg-yellow-400"
                  }`}
                ></div>
                <span className="text-gray-600">
                  System {systemMetrics.uptime > 95 ? "Healthy" : "Warning"}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-lg text-gray-600">Loading dashboard...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {statCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${getIconColor(card.color)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          {card.changeType === "increase" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : card.changeType === "decrease" ? (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          ) : null}
                          <span
                            className={`font-medium ${
                              card.changeType === "increase"
                                ? "text-green-600"
                                : card.changeType === "decrease"
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {card.change}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
                      <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                      <p className="text-gray-500 text-xs mt-1">{card.description}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Additional Dashboard Sections can follow here */}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
