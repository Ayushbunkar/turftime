/**
 * Image compression and validation utilities for file uploads
 */

/**
 * Compress an image file to reduce its size
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 800,
      quality = 0.8,
      maxSizeMB = 5,
    } = options;

    // Create canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (aspectRatio > 1) {
            // Landscape
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
          } else {
            // Portrait
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Check if compression was effective
            const compressedSizeMB = blob.size / (1024 * 1024);
            
            if (compressedSizeMB > maxSizeMB) {
              // Try with lower quality
              const lowerQuality = Math.max(0.1, quality - 0.2);
              
              canvas.toBlob(
                (secondBlob) => {
                  if (secondBlob) {
                    const finalFile = new File([secondBlob], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now(),
                    });
                    resolve(finalFile);
                  } else {
                    reject(new Error('Failed to compress image with lower quality'));
                  }
                },
                'image/jpeg',
                lowerQuality
              );
            } else {
              // Create new file from compressed blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              console.log(`✅ Image compressed: ${file.name}`);
              console.log(`📊 Original: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
              console.log(`📊 Compressed: ${(blob.size / (1024 * 1024)).toFixed(2)}MB`);
              console.log(`📉 Reduction: ${(((file.size - blob.size) / file.size) * 100).toFixed(1)}%`);
              
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Create object URL and load image
    const imageUrl = URL.createObjectURL(file);
    img.src = imageUrl;
    
    // Clean up object URL after image loads
    img.onload = (originalOnLoad => {
      return function(...args) {
        URL.revokeObjectURL(imageUrl);
        return originalOnLoad.apply(this, args);
      };
    })(img.onload);
  });
};

/**
 * Validate file type and size before processing
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSizeMB = 25,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  } = options;

  const errors = [];
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    errors.push(`File size ${fileSizeMB.toFixed(2)}MB exceeds maximum allowed size of ${maxSizeMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    fileSizeMB: fileSizeMB.toFixed(2)
  };
};

/**
 * Process multiple image files with compression and validation
 * @param {FileList|File[]} files - Files to process
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing result
 */
export const processImageFiles = async (files, options = {}) => {
  const filesArray = Array.from(files);
  const results = {
    successful: [],
    failed: [],
    totalOriginalSize: 0,
    totalCompressedSize: 0
  };

  console.log(`🔄 Processing ${filesArray.length} image files...`);

  for (const file of filesArray) {
    try {
      // Validate file first
      const validation = validateImageFile(file, options);
      
      if (!validation.isValid) {
        results.failed.push({
          file,
          error: validation.errors.join('; '),
          originalName: file.name
        });
        continue;
      }

      // Track original size
      results.totalOriginalSize += file.size;

      // Compress if it's a large image
      const fileSizeMB = file.size / (1024 * 1024);
      let processedFile = file;
      
      if (fileSizeMB > 1 && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')) {
        try {
          processedFile = await compressImage(file, options);
        } catch (compressionError) {
          console.warn(`⚠️ Compression failed for ${file.name}, using original:`, compressionError.message);
          processedFile = file;
        }
      }

      // Track compressed size
      results.totalCompressedSize += processedFile.size;

      results.successful.push({
        originalFile: file,
        processedFile,
        originalSize: file.size,
        processedSize: processedFile.size,
        compressionRatio: ((file.size - processedFile.size) / file.size * 100).toFixed(1)
      });

    } catch (error) {
      results.failed.push({
        file,
        error: error.message,
        originalName: file.name
      });
    }
  }

  // Calculate overall compression stats
  const totalReduction = results.totalOriginalSize > 0 
    ? ((results.totalOriginalSize - results.totalCompressedSize) / results.totalOriginalSize * 100).toFixed(1)
    : 0;

  console.log(`✅ Image processing complete:`);
  console.log(`📊 Successful: ${results.successful.length}, Failed: ${results.failed.length}`);
  console.log(`📉 Total size reduction: ${totalReduction}%`);
  console.log(`📊 Original total: ${(results.totalOriginalSize / (1024 * 1024)).toFixed(2)}MB`);
  console.log(`📊 Compressed total: ${(results.totalCompressedSize / (1024 * 1024)).toFixed(2)}MB`);

  return results;
};

/**
 * Create preview URL for image file
 * @param {File} file - Image file
 * @returns {string} Object URL for preview
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Clean up image preview URLs to prevent memory leaks
 * @param {string[]} urls - Array of object URLs to revoke
 */
export const cleanupImagePreviews = (urls) => {
  urls.forEach(url => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};