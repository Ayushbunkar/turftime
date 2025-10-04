import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchTurfs as fetchTurfsService, deleteTurf } from "../../../services/turfAdminService";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { 
  PlusCircle, 
  Search,
  Filter,
  Grid,
  List,
  RefreshCw,
  Flag,
  TrendingUp
} from "lucide-react";
import TurfForm from "./TurfForm";
import TurfAdminCard from "./TurfAdminCard";

export default function TurfAdminTurfs() {
  const { darkMode } = useOutletContext() || {};
  const [turfs, setTurfs] = useState([]);
  const [filteredTurfs, setFilteredTurfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTurfForm, setShowTurfForm] = useState(false);
  const [editingTurf, setEditingTurf] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const sportTypes = [
    { value: "all", label: "All Sports" },
    { value: "football", label: "Football" },
    { value: "cricket", label: "Cricket" },
    { value: "basketball", label: "Basketball" },
    { value: "volleyball", label: "Volleyball" },
    { value: "badminton", label: "Badminton" },
    { value: "tennis", label: "Tennis" },
    { value: "multiple", label: "Multiple Sports" }
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name", label: "Name A-Z" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" }
  ];

  useEffect(() => {
    fetchTurfs();
  }, []);

  useEffect(() => {
    filterAndSortTurfs();
  }, [turfs, searchTerm, filterType, sortBy]);

  const fetchTurfs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTurfsService();
      setTurfs(data);
    } catch (err) {
      console.error("Error fetching turfs:", err);
      toast.error("Could not fetch turfs");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTurfs = () => {
    let filtered = [...turfs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(turf =>
        turf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turf.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turf.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sport type filter
    if (filterType !== "all") {
      filtered = filtered.filter(turf => turf.sportType === filterType);
    }

    // Sort
    switch (sortBy) {
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price_low":
        filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case "price_high":
        filtered.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredTurfs(filtered);
  };

  const handleAddTurf = () => {
    setEditingTurf(null);
    setShowTurfForm(true);
  };

  const handleEditTurf = (turf) => {
    setEditingTurf(turf);
    setShowTurfForm(true);
  };

  const handleViewTurf = (turf) => {
    // Could open a detailed view modal or navigate to turf details
    console.log("View turf:", turf);
    toast.success(`Viewing ${turf.name}`);
  };

  const handleTurfFormClose = () => {
    setShowTurfForm(false);
    setEditingTurf(null);
  };

  const handleTurfAdded = () => {
    fetchTurfs();
  };

  const handleDeleteTurf = async (id) => {
    if (window.confirm("Are you sure you want to delete this turf? This action cannot be undone.")) {
      try {
        await deleteTurf(id);
        toast.success("Turf deleted successfully");
        fetchTurfs();
      } catch (err) {
        console.error("Error deleting turf:", err);
        toast.error("Failed to delete turf");
      }
    }
  };

  const getStats = () => {
    const totalTurfs = turfs.length;
    const activeTurfs = turfs.filter(turf => turf.isActive).length;
    const averagePrice = turfs.length > 0 
      ? turfs.reduce((sum, turf) => sum + turf.pricePerHour, 0) / turfs.length 
      : 0;

    return { totalTurfs, activeTurfs, averagePrice };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 transition-colors duration-200 ${
      darkMode ? 'bg-gray-900 min-h-screen' : 'bg-gray-50 min-h-screen'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Manage Turfs
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create, edit, and manage your sports facilities
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchTurfs}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            
            <button
              onClick={handleAddTurf}
              className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-lg"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Turf
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className={`p-6 rounded-xl shadow-sm border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Flag className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Turfs
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalTurfs}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-sm border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Active Turfs
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.activeTurfs}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-sm border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-bold">₹</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Avg. Price/Hour
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{Math.round(stats.averagePrice)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className={`mb-6 p-4 rounded-xl shadow-sm border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search turfs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Sport Filter */}
            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {sportTypes.map(sport => (
                  <option key={sport.value} value={sport.value}>
                    {sport.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === "grid"
                  ? 'bg-green-600 text-white'
                  : darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === "list"
                  ? 'bg-green-600 text-white'
                  : darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Showing {filteredTurfs.length} of {turfs.length} turfs
      </div>

      {/* Turfs Grid/List */}
      <AnimatePresence>
        {filteredTurfs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-16 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } rounded-xl border`}
          >
            <Flag className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {searchTerm || filterType !== "all" ? "No turfs match your filters" : "No turfs found"}
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your search or filters to find turfs."
                : "Get started by adding your first turf facility."
              }
            </p>
            {(!searchTerm && filterType === "all") && (
              <button
                onClick={handleAddTurf}
                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Your First Turf
              </button>
            )}
          </motion.div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {filteredTurfs.map((turf, index) => (
              <TurfAdminCard
                key={turf._id}
                turf={turf}
                onEdit={handleEditTurf}
                onDelete={handleDeleteTurf}
                onView={handleViewTurf}
                darkMode={darkMode}
                index={index}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Turf Form Modal */}
      <TurfForm
        isOpen={showTurfForm}
        onClose={handleTurfFormClose}
        onTurfAdded={handleTurfAdded}
        editingTurf={editingTurf}
        darkMode={darkMode}
      />

    </div>
  );
}