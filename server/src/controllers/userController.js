import User from '../models/userModel.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json({ user: updated });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone, location, dateOfBirth } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    
    const updateData = { name, email };
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required" 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters long" 
      });
    }
    
    // Find user and include password for verification
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if current password is correct
    const isCurrentPasswordValid = await user.correctPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password change failed", error: err.message });
  }
};
