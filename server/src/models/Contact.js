import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    feedback: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Contact', contactSchema);
