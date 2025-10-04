import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Building,
  TrendingUp,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Star,
  DollarSign,
  Activity,
  Award
} from 'lucide-react';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminNavbar from './SuperAdminNavbar';
import toast from 'react-hot-toast';

const TurfAdminManagement = () => {
  const [turfAdmins, setTurfAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [adminToApprove, setAdminToApprove] = useState(null);

  const adminsPerPage = 10;

  useEffect(() => {
    fetchTurfAdmins();
  }, [currentPage, searchQuery, selectedStatus, sortBy, sortOrder]);

  const fetchTurfAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: adminsPerPage,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedStatus && { status: selectedStatus }),
        sortBy,
        sortOrder
      });

      const response = await fetch(`http://localhost:4500/api/super-admin/turf-admins?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTurfAdmins(data.turfAdmins);
        setTotalPages(data.pagination.totalPages);
        setTotalAdmins(data.pagination.totalAdmins);
      } else {
        // Mock data for demo
        setTurfAdmins([
          {
            _id: '1',
            name: 'John Smith',
            email: 'john.smith@turfowner.com',
            phone: '+1234567890',
            role: 'turfAdmin',
            status: 'approved',
            location: 'New York Sports Complex',
            createdAt: '2024-01-10T08:30:00Z',
            lastLogin: '2024-01-22T16:45:00Z',
            metrics: {
              turfsManaged: 5,
              totalBookings: 234,
              totalRevenue: 45600,
              avgRating: 4.8,
              responseTime: '2 hours'
            }
          },
          {
            _id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.j@sportsarena.com',
            phone: '+1234567891',
            role: 'turfAdmin',
            status: 'pending',
            location: 'Los Angeles Athletic Center',
            createdAt: '2024-01-15T10:15:00Z',
            lastLogin: '2024-01-21T14:20:00Z',
            metrics: {
              turfsManaged: 0,
              totalBookings: 0,
              totalRevenue: 0,
              avgRating: 0,
              responseTime: 'N/A'
            }
          },
          {
            _id: '3',
            name: 'Mike Wilson',
            email: 'mike.wilson@fieldmaster.com',
            phone: '+1234567892',
            role: 'turfAdmin',
            status: 'suspended',
            location: 'Chicago Sports Hub',
            createdAt: '2024-01-05T12:00:00Z',
            lastLogin: '2024-01-18T09:30:00Z',
            metrics: {
              turfsManaged: 3,
              totalBookings: 156,
              totalRevenue: 28900,
              avgRating: 4.2,
              responseTime: '4 hours'
            }
          }
        ]);
        setTotalPages(1);
        setTotalAdmins(3);
      }
    } catch (error) {
      console.error('Error fetching turf admins:', error);
      toast.error('Failed to fetch turf admins');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (adminId, newStatus, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4500/api/super-admin/turf-admins/${adminId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, reason })
      });

      if (response.ok) {
        toast.success(`Turf admin ${newStatus} successfully`);
        fetchTurfAdmins();
        setShowApprovalModal(false);
        setAdminToApprove(null);
      } else {
        toast.error('Failed to update admin status');
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  const handleCreateAdmin = async (adminData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4500/api/super-admin/turf-admins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });

      if (response.ok) {
        toast.success('Turf admin created successfully');
        fetchTurfAdmins();
        setShowCreateModal(false);
      } else {
        toast.error('Failed to create turf admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error('Failed to create turf admin');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'rejected': return 'text-red-700 bg-red-100';
      case 'suspended': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <X className="w-4 h-4 text-red-500" />;
      case 'suspended': return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
              <h1 className="text-3xl font-bold text-gray-900">Turf Admin Management</h1>
              <p className="text-gray-600 mt-1">Manage and monitor turf administrators</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchTurfAdmins}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Turf Admin</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalAdmins}</p>
                  <p className="text-gray-600 text-sm">Total Admins</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {turfAdmins.filter(admin => admin.status === 'approved').length}
                  </p>
                  <p className="text-gray-600 text-sm">Active Admins</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {turfAdmins.filter(admin => admin.status === 'pending').length}
                  </p>
                  <p className="text-gray-600 text-sm">Pending Approval</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {turfAdmins.reduce((total, admin) => total + admin.metrics.turfsManaged, 0)}
                  </p>
                  <p className="text-gray-600 text-sm">Total Turfs Managed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 flex-1 max-w-2xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Statuses</option>
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="createdAt">Date Created</option>
                          <option value="name">Name</option>
                          <option value="lastLogin">Last Login</option>
                          <option value="revenue">Revenue</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                        <select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="desc">Descending</option>
                          <option value="asc">Ascending</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Admins Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Admin</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Performance</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Last Active</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : turfAdmins.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Shield className="w-12 h-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No turf admins found</h3>
                          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    turfAdmins.map((admin) => (
                      <motion.tr
                        key={admin._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {admin.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                              <p className="text-sm text-gray-500">{admin.email}</p>
                              <p className="text-xs text-gray-400">{admin.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(admin.status)}
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(admin.status)}`}>
                              {admin.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Building className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">{admin.metrics.turfsManaged} turfs</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <DollarSign className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">{formatCurrency(admin.metrics.totalRevenue)}</span>
                            </div>
                            {admin.metrics.avgRating > 0 && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span className="text-gray-600">{admin.metrics.avgRating}/5</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              <span>{admin.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-32">{admin.location}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(admin.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {admin.lastLogin ? formatDate(admin.lastLogin) : 'Never'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowAdminModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {admin.status === 'pending' && (
                              <button
                                onClick={() => {
                                  setAdminToApprove(admin);
                                  setShowApprovalModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            
                            {admin.status === 'approved' ? (
                              <button
                                onClick={() => handleStatusUpdate(admin._id, 'suspended')}
                                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : admin.status === 'suspended' && (
                              <button
                                onClick={() => handleStatusUpdate(admin._id, 'approved')}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * adminsPerPage) + 1} to {Math.min(currentPage * adminsPerPage, totalAdmins)} of {totalAdmins} admins
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Admin Details Modal */}
      <AdminDetailsModal
        admin={selectedAdmin}
        isOpen={showAdminModal}
        onClose={() => {
          setShowAdminModal(false);
          setSelectedAdmin(null);
        }}
      />

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateAdmin}
      />

      {/* Approval Modal */}
      <ApprovalModal
        admin={adminToApprove}
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setAdminToApprove(null);
        }}
        onApprove={(adminId, status, reason) => handleStatusUpdate(adminId, status, reason)}
      />
    </div>
  );
};

// Admin Details Modal Component
const AdminDetailsModal = ({ admin, isOpen, onClose }) => {
  if (!admin) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Turf Admin Details</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Admin Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {admin.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{admin.name}</h3>
                    <p className="text-gray-600">{admin.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Turf Administrator</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{admin.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{admin.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{admin.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="text-sm text-gray-500">Joined: </span>
                          <span className="text-sm text-gray-600">{new Date(admin.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="text-sm text-gray-500">Last Login: </span>
                          <span className="text-sm text-gray-600">
                            {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="text-sm text-gray-500">Response Time: </span>
                          <span className="text-sm text-gray-600">{admin.metrics.responseTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Performance Metrics</h4>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Turfs Managed</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{admin.metrics.turfsManaged}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Total Bookings</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{admin.metrics.totalBookings.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Revenue Generated</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(admin.metrics.totalRevenue)}
                    </span>
                  </div>

                  {admin.metrics.avgRating > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">Average Rating</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{admin.metrics.avgRating}/5</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Edit Admin
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Create Admin Modal Component
const CreateAdminModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    setFormData({ name: '', email: '', password: '', phone: '', location: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Turf Admin</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Approval Modal Component
const ApprovalModal = ({ admin, isOpen, onClose, onApprove }) => {
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('approved');

  if (!admin) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onApprove(admin._id, action, reason);
    setReason('');
    setAction('approved');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Admin Approval</h3>
                <p className="text-gray-600">Review turf admin application</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{admin.name}</p>
              <p className="text-sm text-gray-600">{admin.email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="approved"
                      checked={action === 'approved'}
                      onChange={(e) => setAction(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Approve</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="rejected"
                      checked={action === 'rejected'}
                      onChange={(e) => setAction(e.target.value)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Reject</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason {action === 'rejected' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required={action === 'rejected'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={action === 'approved' ? 'Welcome message...' : 'Reason for rejection...'}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${
                    action === 'approved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {action === 'approved' ? 'Approve Admin' : 'Reject Admin'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TurfAdminManagement;