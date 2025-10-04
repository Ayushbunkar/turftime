import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Admin from "../models/Admin.js";
import { sendEmail } from "../utils/sendEmailNew.js";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * Request password reset - sends email with reset token
 */
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  // Check both User and Admin models
  let user = await User.findOne({ email }).select('+password');
  let userType = 'user';

  if (!user) {
    user = await Admin.findOne({ email }).select('+password');
    userType = 'admin';
  }

  if (!user) {
    return next(new AppError("No user found with that email address", 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token and expiry (10 minutes)
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetURL = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}&type=${userType}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message: `
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset for your TurfHub account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>TurfHub Team</p>
      `
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('Email sending error:', err);
    return next(new AppError('There was an error sending the email. Try again later.', 500));
  }
});

/**
 * Reset password using the token from email
 */
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password, confirmPassword, type = 'user' } = req.body;

  if (!token || !password || !confirmPassword) {
    return next(new AppError("Token, password, and confirm password are required", 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  if (password.length < 6) {
    return next(new AppError("Password must be at least 6 characters long", 400));
  }

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid token
  const Model = type === 'admin' ? Admin : User;
  const user = await Model.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // Update password and remove reset token
  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  // Generate new JWT token for immediate login
  const jwtToken = jwt.sign(
    { 
      id: user._id, 
      role: user.role || (type === 'admin' ? 'turfadmin' : 'user')
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful! You are now logged in.',
    token: jwtToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || (type === 'admin' ? 'turfadmin' : 'user')
    }
  });
});

/**
 * Change password for authenticated user
 */
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError("Current password, new password, and confirm password are required", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError("New passwords do not match", 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError("Password must be at least 6 characters long", 400));
  }

  // Determine user type from role
  const userRole = req.user.role || 'user';
  const isAdmin = ['admin', 'turfadmin', 'superadmin'].includes(userRole);
  const Model = isAdmin ? Admin : User;

  // Get user with password
  const user = await Model.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check current password
  const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordCorrect) {
    return next(new AppError("Current password is incorrect", 400));
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully!'
  });
});

/**
 * Verify reset token validity (for frontend validation)
 */
export const verifyResetToken = catchAsync(async (req, res, next) => {
  const { token, type = 'user' } = req.params;

  if (!token) {
    return next(new AppError("Token is required", 400));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const Model = type === 'admin' ? Admin : User;

  const user = await Model.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      status: 'error',
      message: 'Token is invalid or has expired'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Token is valid',
    data: {
      email: user.email,
      name: user.name
    }
  });
});