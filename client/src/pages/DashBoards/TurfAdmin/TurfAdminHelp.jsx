import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function TurfAdminHelp() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      category: "Account",
      questions: [
        {
          q: "How do I reset my password?",
          a: "Go to account settings, click on 'Change Password', and follow the steps. You'll receive a confirmation email once updated.",
        },
        {
          q: "How do I update my contact information?",
          a: "In your profile settings, you can update your email, phone number, and other contact details.",
        },
      ],
    },
    {
      category: "Booking",
      questions: [
        {
          q: "How can I view my turf bookings?",
          a: "Navigate to the Bookings section in your dashboard to see all your past and upcoming bookings.",
        },
        {
          q: "Can I cancel a booking?",
          a: "Yes, bookings can be canceled up to 24 hours before the scheduled time.",
        },
      ],
    },
    {
      category: "Payment",
      questions: [
        {
          q: "How do I receive payments?",
          a: "Payments are automatically transferred to your registered bank account every week.",
        },
        {
          q: "What payment methods are supported?",
          a: "We support all major UPI apps, credit/debit cards, and net banking.",
        },
      ],
    },
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-3">
          Help & Support Center
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Get help with your turf management, find answers to common questions,
          and connect with our support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQs Section */}
        <div className="lg:col-span-2 space-y-6">
          {faqs.map((category, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {category.category}
              </h3>
              <div className="space-y-4">
                {category.questions.map((faq, j) => (
                  <div
                    key={j}
                    className="border-b border-gray-200 dark:border-gray-700 pb-4"
                  >
                    <button
                      onClick={() =>
                        setOpenFAQ(openFAQ === `${i}-${j}` ? null : `${i}-${j}`)
                      }
                      className="flex justify-between items-center w-full text-left"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {faq.q}
                      </span>
                      {openFAQ === `${i}-${j}` ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    {openFAQ === `${i}-${j}` && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 text-gray-700 dark:text-gray-200 leading-relaxed"
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Support Section */}
        <div className="space-y-6">
          {/* Contact Support Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Contact Support
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Email Support
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    support@turfdash.com
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Response within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Phone Support
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    +91 98765 43210
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Mon-Fri, 9AM-6PM
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Live Chat
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Get instant help from our support team
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Available 24/7
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Support Ticket Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Create Support Ticket
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-lg bg-white dark:bg-gray-900 
                             text-gray-900 dark:text-gray-100 
                             focus:ring-2 focus:ring-green-500"
                  placeholder="Enter subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-lg bg-white dark:bg-gray-900 
                             text-gray-900 dark:text-gray-100 
                             focus:ring-2 focus:ring-green-500"
                  placeholder="Describe your issue"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white 
                           py-2 px-4 rounded-lg transition-colors"
              >
                Submit Ticket
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
