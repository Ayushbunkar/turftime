const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Set up storage for uploaded files
const storage = multer.memoryStorage();

// File filter function to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: fileFilter,
});

// Middleware to upload a single avatar file
exports.uploadUserAvatar = upload.single('avatar');

// Middleware to resize avatar image
exports.resizeUserAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../public/uploads/avatars');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Generate unique filename
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  const filePath = path.join(uploadsDir, req.file.filename);

  // Process and save the image
  await sharp(req.file.buffer)
    .resize(250, 250)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(filePath);

  // Add avatar URL to request body
  req.body.avatar = `/uploads/avatars/${req.file.filename}`;
  
  next();
});

// Get current user
exports.getMe = catchAsync(async (req, res, next) => {
  // req.user comes from protect middleware
  res.status(200).json({
    status: 'success',
    user: req.user
  });
});

// Update current user
exports.updateMe = catchAsync(async (req, res, next) => {
  // Disallow password updates via this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updatePassword.', 400));
  }

  // Only allow certain fields to be updated
  const allowedFields = ['name', 'email', 'avatar'];
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  // Check if email is already used by another user
  if (filteredBody.email && filteredBody.email !== req.user.email) {
    const existingUser = await User.findOne({ email: filteredBody.email });
    if (existingUser && existingUser.id !== req.user.id) {
      return next(new AppError('Email already exists. Please use a different email.', 409));
    }
  }

  // If new avatar and user had an old avatar, delete old file
  if (req.body.avatar && req.user.avatar && !req.user.avatar.startsWith('http')) {
    const oldAvatarPath = path.join(__dirname, '../public', req.user.avatar);
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlink(oldAvatarPath, err => {
        if (err) console.error('Error deleting old avatar:', err);
      });
    }
  }

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser
  });
});
