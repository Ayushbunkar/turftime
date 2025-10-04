import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, Filter, Search, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import Sidebar from './Sidebar';
import Navbar from '../../../components/layout/Navbar';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';

const UserPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Fetch payments from backend
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      const response = await api.get('/payments/user');
      setPayments(response.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      // If endpoint doesn't exist, create mock data for demonstration
      const mockPayments = [
        {
          _id: '1',
          amount: 1500,
          status: 'completed',
          paymentMethod: 'UPI',
          transactionId: 'TXN123456789',
          date: new Date('2024-10-01'),
          booking: {
            turfName: 'Green Valley Sports Complex',
            date: '2024-10-05',
            timeSlot: '10:00 AM - 12:00 PM'
          }
        },
        {
          _id: '2',
          amount: 2000,
          status: 'completed',
          paymentMethod: 'Credit Card',
          transactionId: 'TXN987654321',
          date: new Date('2024-09-28'),
          booking: {
            turfName: 'City Sports Arena',
            date: '2024-09-30',
            timeSlot: '6:00 PM - 8:00 PM'
          }
        },
        {
          _id: '3',
          amount: 1200,
          status: 'failed',
          paymentMethod: 'UPI',
          transactionId: 'TXN456789123',
          date: new Date('2024-09-25'),
          booking: {
            turfName: 'Metro Turf Ground',
            date: '2024-09-27',
            timeSlot: '4:00 PM - 6:00 PM'
          }
        }
      ];
      setPayments(mockPayments);
      toast.info('Showing demo payment data');
    } finally {
      setLoading(false);
    }
  };

  // Filter payments based on search and filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.booking?.turfName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    const matchesDate = (() => {
      if (dateRange === 'all') return true;
      
      const paymentDate = new Date(payment.date);
      const now = new Date();
      
      switch (dateRange) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return paymentDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return paymentDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return paymentDate >= yearAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'refunded':
        return { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  // Calculate total spent
  const totalSpent = payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  // Handle download receipt
  const downloadReceipt = (payment) => {
    // This would typically generate and download a PDF receipt
    toast.success(`Receipt for ${payment.transactionId} would be downloaded`);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Please log in to view your payments</div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-gray-900 dark:to-gray-800`}>
      <Navbar user={user} onToggleDark={() => setDarkMode(!darkMode)} />
      <div className="flex">
        <Sidebar user={user} onToggleDark={() => setDarkMode(!darkMode)} darkMode={darkMode} />
        <main className="flex-1 ml-64 p-4 mt-20 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Payment History
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track your payment transactions and download receipts
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CreditCard className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Successful Payments</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {payments.filter(p => p.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {payments.filter(p => {
                        const paymentDate = new Date(p.date);
                        const now = new Date();
                        return paymentDate.getMonth() === now.getMonth() && 
                               paymentDate.getFullYear() === now.getFullYear() &&
                               p.status === 'completed';
                      }).length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by turf name or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>

                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </Card>

            {/* Payments List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : filteredPayments.length > 0 ? (
              <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Transaction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Booking Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPayments.map((payment) => {
                        const statusInfo = getStatusInfo(payment.status);
                        const StatusIcon = statusInfo.icon;
                        
                        return (
                          <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {payment.transactionId}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {payment.paymentMethod}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {payment.booking?.turfName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {payment.booking?.date} • {payment.booking?.timeSlot}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                ₹{payment.amount?.toLocaleString()}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4 mr-1" />
                                {payment.status}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(payment.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {payment.status === 'completed' && (
                                <button
                                  onClick={() => downloadReceipt(payment)}
                                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Receipt
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <Card className="p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
                <div className="text-gray-400 mb-4">
                  <CreditCard className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No payments found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm || filterStatus !== 'all' || dateRange !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : "You haven't made any payments yet"}
                </p>
              </Card>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserPayments;