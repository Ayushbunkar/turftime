import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Get current directory for file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary only if credentials are provided
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
  process.env.CLOUDINARY_API_SECRET !== 'your_api_secret';

if (isCloudinaryConfigured) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('✅ Cloudinary configured successfully with cloud:', process.env.CLOUDINARY_CLOUD_NAME);
  } catch (error) {
    console.error('❌ Cloudinary configuration error:', error.message);
  }
} else {
  console.log('⚠️ Cloudinary not configured - using local file uploads');
}

// Create storage based on Cloudinary availability
let storage;

if (isCloudinaryConfigured) {
  // Use Cloudinary storage
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'turrfown-turfs', // Folder in Cloudinary where images will be stored
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [
        { width: 1200, height: 800, crop: 'fill' }, // Resize images
        { quality: 'auto' }, // Optimize quality
        { fetch_format: 'auto' } // Auto format selection
      ]
    },
  });
} else {
  // Use local disk storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../../uploads/');
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

// Create multer upload middleware
export const uploadToCloudinary = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit per file
    files: 10, // Maximum 10 files
    fieldSize: 1024 * 1024, // 1MB for form fields
  },
  fileFilter: (req, file, cb) => {
    console.log(`📁 Processing file: ${file.originalname} (${file.size} bytes)`);
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      // Check file size on the server side as well
      if (file.size && file.size > 25 * 1024 * 1024) {
        console.error(`❌ File too large: ${file.originalname} (${file.size} bytes)`);
        cb(new Error(`File ${file.originalname} is too large. Maximum size is 25MB.`), false);
        return;
      }
      
      console.log(`✅ File accepted: ${file.originalname}`);
      cb(null, true);
    } else {
      console.error(`❌ Invalid file type: ${file.mimetype} for ${file.originalname}`);
      cb(new Error(`Invalid file type for ${file.originalname}. Only JPEG, PNG, WebP and GIF are allowed.`), false);
    }
  }
});

// Export configuration status
export const isCloudinaryEnabled = isCloudinaryConfigured;

// Function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured) {
    console.log('⚠️ Cloudinary not configured, skipping delete operation');
    return { result: 'not_found' };
  }
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Image deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('❌ Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Function to get optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  if (!isCloudinaryConfigured) {
    console.log('⚠️ Cloudinary not configured, returning original URL');
    return publicId;
  }
  
  const defaultOptions = {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    return cloudinary.url(publicId, mergedOptions);
  } catch (error) {
    console.error('❌ Error generating Cloudinary URL:', error);
    return publicId;
  }
};

// Extract public ID from Cloudinary URL
export const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') return null;
  
  // Extract public ID from Cloudinary URL
  const matches = cloudinaryUrl.match(/\/v\d+\/(.+)\./);
  return matches ? matches[1] : null;
};

export default cloudinary;