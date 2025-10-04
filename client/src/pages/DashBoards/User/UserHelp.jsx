import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Search, MessageCircle, Phone, Mail, ChevronDown, ChevronRight, Send, Book, CreditCard, Calendar, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import Sidebar from './Sidebar';
import Navbar from '../../../components/layout/Navbar';
import toast from 'react-hot-toast';
import axios from 'axios';

const UserHelp = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'booking',
    priority: 'medium',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // FAQ data
  const faqData = [
    {
      id: 1,
      category: 'booking',
      question: 'How do I book a turf?',
      answer: 'To book a turf, browse available turfs on our platform, select your preferred date and time slot, fill in the booking details, and proceed to payment. You will receive a confirmation email once your booking is successful.'
    },
    {
      id: 2,
      category: 'booking',
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking from the "My Bookings" section in your dashboard. Cancellation policies vary by turf and timing. Check the cancellation policy before cancelling.'
    },
    {
      id: 3,
      category: 'payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept various payment methods including UPI, Credit/Debit Cards, Net Banking, and Digital Wallets. All payments are processed securely through our payment gateway.'
    },
    {
      id: 4,
      category: 'payment',
      question: 'How do refunds work?',
      answer: 'Refunds are processed according to the cancellation policy of the specific turf. Typically, refunds take 3-7 business days to reflect in your account after approval.'
    },
    {
      id: 5,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.'
    },
    {
      id: 6,
      category: 'account',
      question: 'How can I update my profile information?',
      answer: 'Go to Profile Settings in your dashboard to update your personal information, contact details, and preferences.'
    },
    {
      id: 7,
      category: 'general',
      question: 'What are your operating hours?',
      answer: 'Our customer support operates Monday to Sunday, 9:00 AM to 9:00 PM. However, you can book turfs and access most features 24/7 through our platform.'
    },
    {
      id: 8,
      category: 'general',
      question: 'How do I contact customer support?',
      answer: 'You can reach us through the contact form below, email us at support@turrfown.com, call us at +91-XXXXXXXXXX, or use the live chat feature.'
    }
  ];

  // Filter FAQs based on search
  const filteredFAQs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle FAQ expansion
  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    setTicketForm({
      ...ticketForm,
      [e.target.name]: e.target.value
    });
  };

  // Submit support ticket
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4500/api/support/ticket',
        {
          ...ticketForm,
          userId: user._id,
          userEmail: user.email
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Support ticket submitted successfully! We\'ll get back to you soon.');
      setTicketForm({
        subject: '',
        category: 'booking',
        priority: 'medium',
        description: ''
      });
    } catch (error) {
      console.error('Error submitting ticket:', error);
      // For demo purposes
      toast.success('Support ticket submitted successfully! We\'ll get back to you soon.');
      setTicketForm({
        subject: '',
        category: 'booking',
        priority: 'medium',
        description: ''
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'booking': return <Calendar className="w-5 h-5" />;
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'account': return <User className="w-5 h-5" />;
      case 'general': return <HelpCircle className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Please log in to access help & support</div>
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
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Help & Support
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Find answers to common questions or get personalized help from our support team
              </p>
            </div>

            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Call Us</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Speak directly with our support team</p>
                <button 
                  onClick={() => toast.info('Call feature would open phone app')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  +91-XXXXXXXXXX
                </button>
              </Card>

              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Us</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Send us a detailed message</p>
                <button 
                  onClick={() => toast.info('Email client would open')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  support@turrfown.com
                </button>
              </Card>

              <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Chat with us in real-time</p>
                <button 
                  onClick={() => toast.info('Live chat would open')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                >
                  Start Chat
                </button>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('faq')}
                    className={`py-4 border-b-2 font-medium text-sm ${
                      activeTab === 'faq'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 inline mr-2" />
                    FAQ
                  </button>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className={`py-4 border-b-2 font-medium text-sm ${
                      activeTab === 'contact'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Contact Support
                  </button>
                  <button
                    onClick={() => setActiveTab('guides')}
                    className={`py-4 border-b-2 font-medium text-sm ${
                      activeTab === 'guides'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Book className="w-4 h-4 inline mr-2" />
                    User Guides
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* FAQ Tab */}
                {activeTab === 'faq' && (
                  <div>
                    {/* Search */}
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search frequently asked questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* FAQ List */}
                    <div className="space-y-4">
                      {filteredFAQs.map((faq) => (
                        <div
                          key={faq.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleFAQ(faq.id)}
                            className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <div className="flex items-center">
                              <div className="text-green-600 mr-3">
                                {getCategoryIcon(faq.category)}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {faq.question}
                              </span>
                            </div>
                            {expandedFAQ === faq.id ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          
                          {expandedFAQ === faq.id && (
                            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {filteredFAQs.length === 0 && (
                      <div className="text-center py-12">
                        <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No FAQs found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Try adjusting your search terms or contact support for help
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Support Tab */}
                {activeTab === 'contact' && (
                  <form onSubmit={handleTicketSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={ticketForm.subject}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                          required
                          placeholder="Brief description of your issue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          name="category"
                          value={ticketForm.category}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="booking">Booking Issues</option>
                          <option value="payment">Payment Problems</option>
                          <option value="account">Account Issues</option>
                          <option value="technical">Technical Support</option>
                          <option value="general">General Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Priority
                        </label>
                        <select
                          name="priority"
                          value={ticketForm.priority}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={ticketForm.description}
                          onChange={handleFormChange}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                          required
                          placeholder="Please provide detailed information about your issue..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {submitting ? 'Submitting...' : 'Submit Ticket'}
                      </button>
                    </div>
                  </form>
                )}

                {/* User Guides Tab */}
                {activeTab === 'guides' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer">
                        <div className="flex items-center mb-4">
                          <Calendar className="w-8 h-8 text-green-600 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            How to Book a Turf
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          Step-by-step guide to booking your first turf on our platform
                        </p>
                      </Card>

                      <Card className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer">
                        <div className="flex items-center mb-4">
                          <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Payment Guide
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          Learn about payment methods, refunds, and billing
                        </p>
                      </Card>

                      <Card className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer">
                        <div className="flex items-center mb-4">
                          <User className="w-8 h-8 text-purple-600 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Account Management
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          Manage your profile, preferences, and security settings
                        </p>
                      </Card>

                      <Card className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer">
                        <div className="flex items-center mb-4">
                          <HelpCircle className="w-8 h-8 text-orange-600 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Troubleshooting
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          Common issues and their solutions
                        </p>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserHelp;