import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "superAdmin", "turfAdmin", "turfadmin"],
      default: "user"
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
