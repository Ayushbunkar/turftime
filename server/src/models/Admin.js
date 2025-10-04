import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    default: 'turfadmin',
    enum: ['turfadmin', 'admin', 'superAdmin', 'superadmin']
  },
  turfName: { type: String },
  phoneNumber: { type: String },
  businessName: { type: String },
  description: { type: String },
  address: { type: String },
  phone: { type: String },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'suspended', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
