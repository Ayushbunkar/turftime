// src/pages/AdminAnalytics.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({
    bookings: [],
    revenue: [],
    turfUsage: [],
    userDistribution: [],
  });

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("http://localhost:4500/api/admin/analytics", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Error fetching analytics", err);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <div className="p-8 space-y-8">
      {/* Page Title */}
      <motion.h1
        className="text-3xl font-bold text-green-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Admin Analytics
      </motion.h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Bookings", value: analyticsData.bookings.length },
          {
            label: "Total Revenue",
            value: `$${analyticsData.revenue.reduce(
              (sum, r) => sum + r.amount,
              0
            )}`,
          },
          {
            label: "Active Turfs",
            value: analyticsData.turfUsage.length,
          },
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            whileHover={{ scale: 1.03 }}
          >
            <h2 className="text-lg font-semibold text-gray-700">
              {card.label}
            </h2>
            <p className="text-2xl font-bold text-green-700">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bookings Over Time */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold mb-4">Bookings Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.bookings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#16a34a"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Bar Chart */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-semibold mb-4">Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Turf Usage Pie Chart */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow lg:col-span-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-lg font-semibold mb-4">Turf Usage Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.turfUsage}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                fill="#16a34a"
                label
              >
                {analyticsData.turfUsage.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#16a34a", "#22c55e", "#4ade80", "#86efac"][index % 4]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
