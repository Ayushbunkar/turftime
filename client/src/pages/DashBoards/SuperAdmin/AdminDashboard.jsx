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
  RefreshCw
} from "lucide-react";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminNavbar from "./SuperAdminNavbar";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTurfs: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    turfAdmins: 0,
    pendingApprovals: 0,
    systemHealth: 100
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Parallel API calls for better performance
      const [statsRes, activitiesRes, metricsRes] = await Promise.all([
        fetch("http://localhost:4500/api/admin/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null),
        fetch("http://localhost:4500/api/admin/recent-activities", {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null),
        fetch("http://localhost:4500/api/admin/system-metrics", {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null)
      ]);

      // Handle stats
      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        // Mock data for demonstration
        setStats({
          totalUsers: 1247,
          totalTurfs: 156,
          totalBookings: 3892,
          totalRevenue: 125430,
          activeUsers: 847,
          turfAdmins: 23,
          pendingApprovals: 7,
          systemHealth: 98
        });
      }

      // Handle activities
      if (activitiesRes && activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setRecentActivities(activitiesData.activities || []);
      } else {
        // Mock activities
        setRecentActivities([
          { id: 1, action: "New user registration", user: "John Doe", time: "2 mins ago", type: "user" },
          { id: 2, action: "Turf booking completed", user: "Sports Center A", time: "5 mins ago", type: "booking" },
          { id: 3, action: "New turf admin approved", user: "Mike Johnson", time: "15 mins ago", type: "admin" },
          { id: 4, action: "Payment processed", user: "₹2,500", time: "22 mins ago", type: "payment" },
          { id: 5, action: "System backup completed", user: "System", time: "1 hour ago", type: "system" }
        ]);
      }

      // Handle metrics
      if (metricsRes && metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setSystemMetrics(metricsData);
      } else {
        // Mock metrics
        setSystemMetrics({
          serverLoad: 23,
          memoryUsage: 67,
          diskUsage: 45,
          networkTraffic: 89,
          responseTime: 125
        });
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers?.toLocaleString() || "0",
      change: "+12.5%",
      changeType: "increase",
      icon: Users,
      color: "blue",
      description: `${stats.activeUsers} active today`
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
      value: `₹${(stats.totalRevenue / 1000).toFixed(1)}K` || "₹0",
      change: "+18.7%",
      changeType: "increase",
      icon: DollarSign,
      color: "orange",
      description: "Monthly revenue"
    },
    {
      title: "Turf Admins",
      value: stats.turfAdmins?.toLocaleString() || "0",
      change: "+3",
      changeType: "increase",
      icon: Shield,
      color: "indigo",
      description: `${stats.pendingApprovals} pending approval`
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
      case 'user': return <Users className="w-4 h-4 text-blue-500" />;
      case 'booking': return <Calendar className="w-4 h-4 text-green-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'payment': return <DollarSign className="w-4 h-4 text-orange-500" />;
      case 'system': return <Activity className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SuperAdminSidebar />
      
      <div className="flex-1 ml-80">
        <SuperAdminNavbar />
        
        <main className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${getIconColor(card.color)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          {card.changeType === 'increase' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : card.changeType === 'decrease' ? (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          ) : null}
                          <span className={`font-medium ${
                            card.changeType === 'increase' ? 'text-green-600' :
                            card.changeType === 'decrease' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {card.change}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
                        <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                        <p className="text-gray-500 text-xs mt-1">{card.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View All</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentActivities.slice(0, 8).map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-500">{activity.user}</p>
                          </div>
                          <div className="text-xs text-gray-400">{activity.time}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* System Metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">System Metrics</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      {Object.entries(systemMetrics).map(([key, value]) => {
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        const percentage = typeof value === 'number' ? Math.min(value, 100) : 0;
                        const color = percentage > 80 ? 'red' : percentage > 60 ? 'yellow' : 'green';
                        
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-gray-700">{label}</span>
                              <span className="text-gray-500">
                                {key === 'responseTime' ? `${value}ms` : `${value}%`}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  color === 'green' ? 'bg-green-500' :
                                  color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
              >
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Add Turf Admin", action: "add-admin" },
                    { label: "System Backup", action: "backup" },
                    { label: "Generate Report", action: "report" },
                    { label: "Send Notifications", action: "notify" }
                  ].map((item) => (
                    <button
                      key={item.action}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
