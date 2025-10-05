import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Server,
  Activity,
  BarChart3,
  FileText,
  Shield,
  Trash2,
  Archive,
  Settings,
  Play,
  Pause,
  Eye,
  Copy,
  ExternalLink
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminNavbar from './SuperAdminNavbar';
import superAdminService from '../../../services/superAdminService';
import toast from 'react-hot-toast';

const SuperAdminDatabase = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState('all');
  
  const [databaseStats, setDatabaseStats] = useState({
    totalSize: '2.4 GB',
    totalTables: 45,
    totalRecords: 125670,
    lastBackup: '2025-01-04T10:30:00Z',
    connectionPool: 85,
    queryPerformance: 'Good'
  });

  const [tables, setTables] = useState([]);
  const [backups, setBackups] = useState([]);
  const [queries, setQueries] = useState([]);
  const [performance, setPerformance] = useState([]);

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);

  useEffect(() => {
    fetchDatabaseInfo();
  }, [selectedDatabase]);

  const fetchDatabaseInfo = async () => {
    try {
      setLoading(true);
      
      // Fetch various database information
      const [statsResponse, tablesResponse, backupsResponse, queriesResponse, performanceResponse] = await Promise.allSettled([
        superAdminService.getDatabaseStats(),
        superAdminService.getDatabaseTables(),
        superAdminService.getDatabaseBackups(),
        superAdminService.getDatabaseQueries(),
        superAdminService.getDatabasePerformance()
      ]);

      // Set stats data
      if (statsResponse.status === 'fulfilled' && statsResponse.value) {
        setDatabaseStats(statsResponse.value);
      } else {
        console.error("Failed to load database stats:", statsResponse.reason);
        toast.error("Failed to load database statistics");
      }
      
      // Set tables data
      if (tablesResponse.status === 'fulfilled' && tablesResponse.value) {
        setTables(tablesResponse.value.tables || []);
      } else {
        console.error("Failed to load database tables:", tablesResponse.reason);
        setTables([]);
      }

      // Set backups data
      if (backupsResponse.status === 'fulfilled' && backupsResponse.value) {
        setBackups(backupsResponse.value.backups || []);
      } else {
        console.error("Failed to load backups:", backupsResponse.reason);
        setBackups([]);
      }

      // Set queries data
      if (queriesResponse.status === 'fulfilled' && queriesResponse.value) {
        setQueries(queriesResponse.value.queries || []);
      } else {
        console.error("Failed to load queries:", queriesResponse.reason);
        setQueries([]);
      }

      // Set performance data
      if (performanceResponse.status === 'fulfilled' && performanceResponse.value) {
        setPerformance(performanceResponse.value.performance || []);
      } else {
        console.error("Failed to load performance data:", performanceResponse.reason);
        setPerformance([]);
      }

    } catch (error) {
      console.error("Error fetching database info:", error);
      toast.error("Failed to load database information");
      // Set empty arrays on error
      setTables([]);
      setBackups([]);
      setQueries([]);
      setPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async (backupType) => {
    try {
      await superAdminService.createDatabaseBackup({ type: backupType });
      toast.success("Backup initiated successfully");
      setShowBackupModal(false);
      fetchDatabaseInfo();
    } catch (error) {
      toast.error("Failed to create backup");
    }
  };

  const handleRestoreBackup = async () => {
    try {
      await superAdminService.restoreDatabaseBackup(selectedBackup.id);
      toast.success("Database restore initiated");
      setShowRestoreModal(false);
      setSelectedBackup(null);
      fetchDatabaseInfo();
    } catch (error) {
      toast.error("Failed to restore backup");
    }
  };

  const handleDownloadBackup = async (backupId) => {
    try {
      await superAdminService.downloadBackup(backupId);
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download backup");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      healthy: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100'
    };
    return colors[status] || colors.healthy;
  };

  const getStatusIcon = (status) => {
    const icons = {
      healthy: <CheckCircle className="w-4 h-4" />,
      warning: <AlertTriangle className="w-4 h-4" />,
      error: <AlertTriangle className="w-4 h-4" />
    };
    return icons[status] || icons.healthy;
  };

  const statCards = [
    {
      title: "Database Size",
      value: databaseStats.totalSize,
      change: "+5.2%",
      changeType: "increase",
      icon: HardDrive,
      color: "blue"
    },
    {
      title: "Total Tables",
      value: databaseStats.totalTables,
      change: "0",
      changeType: "neutral",
      icon: Database,
      color: "green"
    },
    {
      title: "Total Records",
      value: databaseStats.totalRecords?.toLocaleString() || '0',
      change: "+1,234",
      changeType: "increase",
      icon: FileText,
      color: "purple"
    },
    {
      title: "Connection Pool",
      value: `${databaseStats.connectionPool}%`,
      change: "+3%",
      changeType: "increase",
      icon: Server,
      color: "orange"
    }
  ];

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && tables.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SuperAdminSidebar />
      <div className="flex-1 lg:ml-80">
          <SuperAdminNavbar />
          <main className="p-4 lg:p-12 pb-4 pt-32 lg:pt-40 min-h-screen">
            <div className="flex items-center justify-center h-96">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-lg text-gray-600">Loading database information...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SuperAdminSidebar />
      
      <div className="flex-1 lg:ml-80">
        <SuperAdminNavbar />
        
        <main className="p-4 lg:p-8 pb-4 pt-32 lg:pt-40 min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
              <p className="text-gray-600 mt-1">Monitor and manage database operations</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDatabaseInfo}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowBackupModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Create Backup</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    <div className={`p-3 rounded-lg bg-${card.color}-100 text-${card.color}-600`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium ${card.changeType === 'increase' ? 'text-green-600' : card.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'}`}>
                      {card.change}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
                    <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: Database },
                  { id: 'tables', label: 'Tables', icon: FileText },
                  { id: 'backups', label: 'Backups', icon: Archive },
                  { id: 'performance', label: 'Performance', icon: Activity },
                  { id: 'queries', label: 'Queries', icon: Search }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Database Performance Chart */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Performance (24h)</h3>
                    {performance.length === 0 ? (
                      <div className="text-center py-12">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No performance data available</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="connections" stroke="#3B82F6" strokeWidth={2} />
                          <Line type="monotone" dataKey="queries" stroke="#10B981" strokeWidth={2} />
                          <Line type="monotone" dataKey="responseTime" stroke="#F59E0B" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Last Backup</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            {new Date(databaseStats.lastBackup).toLocaleDateString()} at{' '}
                            {new Date(databaseStats.lastBackup).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Daily automated backup</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Query Performance</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{databaseStats.queryPerformance}</p>
                          <p className="text-xs text-gray-500 mt-1">Average response time: 32ms</p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tables' && (
                <div className="space-y-6">
                  {/* Search and Filters */}
                  <div className="flex items-center justify-between">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search tables..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Tables List */}
                  {filteredTables.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tables Found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm ? 'No tables match your search criteria.' : 'No database tables available.'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Table Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Records
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Size
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Updated
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredTables.map((table, index) => (
                          <motion.tr
                            key={table.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Database className="w-5 h-5 text-gray-400 mr-3" />
                                <div className="text-sm font-medium text-gray-900">{table.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{table.records?.toLocaleString() || '0'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{table.size}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                                {getStatusIcon(table.status)}
                                <span className="ml-1">{table.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(table.lastUpdated).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-900">
                                  <Settings className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  )}
                </div>
              )}

              {activeTab === 'backups' && (
                <div className="space-y-6">
                  {/* Backups List */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Backup Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {backups.map((backup, index) => (
                          <motion.tr
                            key={backup.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Archive className="w-5 h-5 text-gray-400 mr-3" />
                                <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{backup.size}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                backup.type === 'full' ? 'bg-blue-100 text-blue-800' : 
                                backup.type === 'incremental' ? 'bg-green-100 text-green-800' : 
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {backup.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(backup.date).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {backup.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDownloadBackup(backup.id)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBackup(backup);
                                    setShowRestoreModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                  title="Restore"
                                >
                                  <Upload className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  {/* Performance Charts */}
                  {performance.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data</h3>
                      <p className="text-gray-600 mb-4">
                        Performance metrics are not available at the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Pool Usage</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={performance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="connections" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Response Time</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={performance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="responseTime" fill="#10B981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'queries' && (
                <div className="space-y-6">
                  {/* Top Queries */}
                  {queries.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Query Data</h3>
                      <p className="text-gray-600 mb-4">
                        No database queries have been recorded yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Query
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Executions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Avg Time (ms)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Duration (ms)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {queries.map((query, index) => (
                          <motion.tr
                            key={query.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-mono text-gray-900 max-w-md truncate">
                                {query.query}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{query.executions?.toLocaleString() || '0'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{(query.avgTime * 1000).toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{(query.duration * 1000).toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-900">
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Backup Modal */}
      <AnimatePresence>
        {showBackupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Database Backup</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 mb-4">
                    Choose the type of backup you want to create:
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleCreateBackup('full')}
                    className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900">Full Backup</div>
                    <div className="text-sm text-gray-600">Complete database backup (recommended)</div>
                  </button>
                  
                  <button
                    onClick={() => handleCreateBackup('incremental')}
                    className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900">Incremental Backup</div>
                    <div className="text-sm text-gray-600">Only changes since last backup</div>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restore Backup Modal */}
      <AnimatePresence>
        {showRestoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Restore Database</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to restore from backup "{selectedBackup?.name}"? This will overwrite the current database and cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestoreBackup}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Restore Database
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminDatabase;