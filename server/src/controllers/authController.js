import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "user", // Set default role explicitly
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role || "user" },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET CURRENT USER
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the authenticate middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        role: user.role || "user"
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
