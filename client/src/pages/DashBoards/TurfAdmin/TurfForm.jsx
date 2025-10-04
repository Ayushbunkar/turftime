import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Upload, 
  Trash2, 
  MapPin, 
  Tag, 
  DollarSign, 
  FileText,
  Users,
  Clock,
  Star
} from "lucide-react";
import { createTurf, updateTurf } from "../../../services/turfAdminService";
import toast from "react-hot-toast";
import { processImageFiles, validateImageFile, formatFileSize } from "../../../utils/imageUtils";

export default function TurfForm({ 
  isOpen, 
  onClose, 
  onTurfAdded, 
  editingTurf = null,
  darkMode = false 
}) {
  const [formData, setFormData] = useState({
    name: editingTurf?.name || "",
    address: editingTurf?.address || editingTurf?.location || "", // Use address, fallback to location for existing data
    description: editingTurf?.description || "",
    sportType: editingTurf?.sportType || "football",
    pricePerHour: editingTurf?.pricePerHour?.toString() || "",
    amenities: editingTurf?.amenities || [],
    capacity: editingTurf?.capacity?.toString() || "",
    size: editingTurf?.size || ""
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState(editingTurf?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [imageProcessingProgress, setImageProcessingProgress] = useState('');

  const sportTypes = [
    { value: "football", label: "Football" },
    { value: "cricket", label: "Cricket" },
    { value: "basketball", label: "Basketball" },
    { value: "volleyball", label: "Volleyball" },
    { value: "badminton", label: "Badminton" },
    { value: "tennis", label: "Tennis" },
    { value: "multiple", label: "Multiple Sports" }
  ];

  const amenityOptions = [
    "Changing Rooms",
    "Showers", 
    "Washrooms",
    "Drinking Water",
    "Flood Lights",
    "Parking",
    "Seating",
    "Equipment Rental",
    "Cafeteria",
    "First Aid",
    "Security",
    "WiFi"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, value]
        : prev.amenities.filter(item => item !== value)
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    setIsProcessingImages(true);
    setImageProcessingProgress('Validating and compressing images...');
    
    try {
      // Process images with compression
      const processingResult = await processImageFiles(files, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.8,
        maxSizeMB: 5, // Target size after compression
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      });
      
      // Handle failed files
      if (processingResult.failed.length > 0) {
        const failedMessages = processingResult.failed.map(f => 
          `${f.originalName}: ${f.error}`
        ).join('\n');
        toast.error(`Some files could not be processed:\n${failedMessages}`);
      }
      
      // Add successful files
      if (processingResult.successful.length > 0) {
        const processedFiles = processingResult.successful.map(result => result.processedFile);
        setImageFiles(prev => [...prev, ...processedFiles]);
        
        // Create preview URLs
        const newPreviewImages = processedFiles.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newPreviewImages]);
        
        // Show success message
        const totalOriginalMB = (processingResult.totalOriginalSize / (1024 * 1024)).toFixed(2);
        const totalCompressedMB = (processingResult.totalCompressedSize / (1024 * 1024)).toFixed(2);
        
        toast.success(`${processedFiles.length} images processed successfully!\nSize reduced from ${totalOriginalMB}MB to ${totalCompressedMB}MB`);
      }
      
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process images. Please try again.');
    } finally {
      setIsProcessingImages(false);
      setImageProcessingProgress('');
    }
  };

  const removePreviewImage = (index) => {
    const updatedPreviews = [...previewImages];
    const removedImage = updatedPreviews[index];
    
    // Check if it's a blob URL and revoke it
    if (removedImage && removedImage.startsWith('blob:')) {
      URL.revokeObjectURL(removedImage);
      // Also remove from imageFiles
      const updatedFiles = [...imageFiles];
      const fileIndex = imageFiles.findIndex(file => 
        URL.createObjectURL(file) === removedImage
      );
      if (fileIndex !== -1) {
        updatedFiles.splice(fileIndex, 1);
        setImageFiles(updatedFiles);
      }
    }
    
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      return toast.error("Turf name is required");
    }
    if (!formData.address.trim()) {
      return toast.error("Address is required");
    }
    if (!formData.description.trim()) {
      return toast.error("Description is required");
    }
    if (!formData.pricePerHour || Number(formData.pricePerHour) <= 0) {
      return toast.error("Valid price per hour is required");
    }

    // Validate image files before submission
    const totalFiles = imageFiles.length;
    if (totalFiles > 10) {
      return toast.error("Maximum 10 images allowed");
    }

    // Check individual file sizes
    const oversizedFiles = imageFiles.filter(file => file.size > 25 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      return toast.error(`${oversizedFiles.length} file(s) are larger than 25MB. Please compress them first.`);
    }

    // Check total upload size
    const totalSizeMB = imageFiles.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024);
    if (totalSizeMB > 100) { // 100MB total limit
      return toast.error(`Total file size (${totalSizeMB.toFixed(1)}MB) exceeds 100MB limit. Please reduce file sizes.`);
    }

    setIsSubmitting(true);
    
    try {
      const turfData = new FormData();
      turfData.append("name", formData.name);
      turfData.append("address", formData.address);
      turfData.append("description", formData.description);
      turfData.append("sportType", formData.sportType);
      turfData.append("pricePerHour", formData.pricePerHour);
      turfData.append("amenities", JSON.stringify(formData.amenities));
      
      if (formData.capacity) {
        turfData.append("capacity", formData.capacity);
      }
      if (formData.size) {
        turfData.append("size", formData.size);
      }
      
      // Add new image files
      imageFiles.forEach((file, index) => {
        console.log(`📎 Adding file ${index + 1}: ${file.name} (${formatFileSize(file.size)})`);
        turfData.append("images", file);
      });

      console.log(`📊 Total files to upload: ${imageFiles.length}`);
      console.log(`📊 Total upload size: ${formatFileSize(imageFiles.reduce((sum, file) => sum + file.size, 0))}`);
      
      if (editingTurf) {
        await updateTurf(editingTurf._id, turfData);
        toast.success("Turf updated successfully!");
      } else {
        await createTurf(turfData);
        toast.success("Turf created successfully!");
        
        // Signal to other tabs/components that a turf was created
        localStorage.setItem('turfCreated', Date.now().toString());
        
        // Trigger a custom event for same-page refresh
        window.dispatchEvent(new CustomEvent('turfCreated', { 
          detail: { timestamp: Date.now() } 
        }));
      }
      
      // Reset form and close
      resetForm();
      onTurfAdded();
      onClose();
    } catch (error) {
      console.error("Error saving turf:", error);
      toast.error(error.message || "Failed to save turf");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      description: "",
      sportType: "football",
      pricePerHour: "",
      amenities: [],
      capacity: "",
      size: ""
    });
    setImageFiles([]);
    setPreviewImages([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingTurf ? 'Edit Turf' : 'Add New Turf'}
          </h2>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Basic Information
              </h3>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Tag className="w-4 h-4 inline mr-2" />
                Turf Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter turf name"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <MapPin className="w-4 h-4 inline mr-2" />
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter complete address"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Sport Type *
              </label>
              <select
                name="sportType"
                value={formData.sportType}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              >
                {sportTypes.map(sport => (
                  <option key={sport.value} value={sport.value}>
                    {sport.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <DollarSign className="w-4 h-4 inline mr-2" />
                Price Per Hour *
              </label>
              <input
                type="number"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter price in ₹"
                min="0"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Users className="w-4 h-4 inline mr-2" />
                Capacity (Optional)
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Max number of players"
                min="0"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Size (Optional)
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="e.g., 100x60 feet"
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <FileText className="w-4 h-4 inline mr-2" />
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 resize-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Describe your turf, facilities, and features..."
                required
              />
            </div>

            {/* Amenities */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenityOptions.map(amenity => (
                  <label key={amenity} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleAmenityChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-2"
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {amenity}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Upload className="w-4 h-4 inline mr-2" />
                Images
              </label>
              
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                isProcessingImages
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : darkMode 
                    ? 'border-gray-600 hover:border-green-500 bg-gray-700/50' 
                    : 'border-gray-300 hover:border-green-500 bg-gray-50'
              }`}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={isProcessingImages || isSubmitting}
                />
                <label htmlFor="image-upload" className={`cursor-pointer ${isProcessingImages ? 'pointer-events-none' : ''}`}>
                  {isProcessingImages ? (
                    <>
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className={`${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        {imageProcessingProgress}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                        Please wait while we compress your images...
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Click to upload images or drag and drop
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        PNG, JPG, WebP up to 25MB each (will be compressed automatically)
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Recommended: High-quality images for best results
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePreviewImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isProcessingImages}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center"
            >
              {(isSubmitting || isProcessingImages) && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              {isProcessingImages 
                ? 'Processing Images...'
                : isSubmitting 
                  ? (editingTurf ? 'Updating...' : 'Creating...') 
                  : (editingTurf ? 'Update Turf' : 'Create Turf')
              }
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
