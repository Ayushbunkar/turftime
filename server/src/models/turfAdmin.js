import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  },
  turfName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  }
});

export default mongoose.model('Admin', adminSchema);
