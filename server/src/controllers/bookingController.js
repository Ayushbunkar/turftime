import Booking from "../models/Booking.js";
import { sendEmail } from "../utils/sendEmail.js";

// 🟢 Create Booking + send confirmation email
export const createBooking = async (req, res) => {
  const { name, email, dateTime } = req.body;

  try {
    const booking = new Booking({ name, email, dateTime });
    await booking.save();

    // Send confirmation email
    await sendEmail(
      email,
      "Turf Booking Confirmed",
      `<h3>Hi ${name},</h3><p>Your turf is booked for ${new Date(
        dateTime
      ).toLocaleString()}.</p>`
    );

    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    res.status(500).json({
      message: "Booking failed",
      error: err.message,
    });
  }
};

// 🟢 Get bookings by email (for frontend queries)
export const getBookingsByEmail = async (req, res) => {
  try {
    const bookings = await Booking.find({ email: req.query.email }).sort({
      dateTime: 1,
    });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({
      message: "Could not retrieve bookings",
      error: err.message,
    });
  }
};

// 🟢 Cancel booking by ID
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Cancellation failed",
      error: err.message,
    });
  }
};

// 🟢 Get bookings for logged-in user (via JWT)
import jwt from "jsonwebtoken";
export const getUserBookings = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const bookings = await Booking.find({ user: decoded.userId }).populate(
      "turf"
    );

    res.json(bookings);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
