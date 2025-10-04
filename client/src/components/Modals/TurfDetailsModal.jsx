// src/components/Modals/TurfDetailsModal.jsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Calendar } from "../ui/Calendar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-custom.css";
import "./datepicker-custom.css";
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Navigation,
  Clock,
  Eye,
  Play,
  CheckCircle,
  Copy,
  Award,
} from "lucide-react";
import { weatherIcons, demandColors } from "../../constants/appConstants";

const TurfDetailsModal = ({ turf }) => {
  // Support range selection for calendar
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const navigate = useNavigate();
  
  if (!turf) return null;
  
  // Get count of available time slots
  const getAvailableSlotsCount = (timeSlots) => {
    if (!Array.isArray(timeSlots)) {
      return 0;
    }
    return timeSlots.filter(slot => slot.available !== false && !slot.booked).length;
  };
  
  const WeatherIcon = weatherIcons[turf?.weather?.condition] || weatherIcons.sunny;

  // Simulate backend slot availability for selected date/range
  // Example: slots 8-12 and 18-20 are booked
  const getExampleAvailability = () => {
    const bookedSlots = [8, 9, 10, 11, 12, 18, 19, 20];
    return Array.from({ length: 24 }, (_, i) => {
      const startHour = i;
      const endHour = i + 1;
      const pad = (n) => n.toString().padStart(2, "0");
      return {
        time: `${pad(startHour)}:00 - ${pad(endHour)}:00`,
        available: !bookedSlots.includes(i),
        price: turf?.price || 0,
      };
    });
  };
  const hourlySlots = getExampleAvailability();

  // Handle slot selection (multi-select)
  const toggleSlot = (idx) => {
    setSelectedSlots((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Calculate total price for selected slots
  const totalPrice = selectedSlots.reduce((sum, idx) => sum + hourlySlots[idx].price, 0);

  return (
    <>
      <DialogHeader className="border-b pb-4">
        <div className="flex justify-between items-start">
          <div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {turf?.name || "Unknown Turf"}
            </DialogTitle>
            <DialogDescription className="text-lg mt-2">
              <span className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                {turf?.address || "Address not available"}
              </span>
            </DialogDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              ₹{turf?.price || 0}
            </div>
            <div className="text-gray-500">per hour</div>
            <div className="flex items-center justify-end mt-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1 font-semibold">{turf?.rating || 0}</span>
              <span className="ml-1 text-gray-500">
                ({turf?.reviews || 0} reviews)
              </span>
            </div>
          </div>
        </div>
      </DialogHeader>
      <div className="pt-6">
        <div className="mb-4 flex flex-col items-center justify-center">
          <label className="block text-lg font-semibold mb-2 text-center">Select Date or Range:</label>
          <div className="flex justify-center">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedRange(null);
              }}
              startDate={selectedRange ? selectedRange[0] : selectedDate}
              endDate={selectedRange ? selectedRange[1] : selectedDate}
              selectsRange
              inline
            />
          </div>
          {selectedRange && (
            <div className="mt-2 text-green-700 font-semibold">
              Selected: {selectedRange[0]?.toLocaleDateString()} - {selectedRange[1]?.toLocaleDateString()}
            </div>
          )}
          <Button
            className="mt-4 bg-green-600 text-white font-bold px-6 py-2 rounded-lg shadow-md hover:bg-green-800 transition-all"
            onClick={() => {
              // Confirm selection, could trigger slot fetch or just visual feedback
              if (selectedRange) {
                alert(`Date range selected: ${selectedRange[0]?.toLocaleDateString()} - ${selectedRange[1]?.toLocaleDateString()}`);
              } else {
                alert(`Date selected: ${selectedDate.toLocaleDateString()}`);
              }
            }}
          >
            Select Date(s)
          </Button>
        </div>
        <div className="mb-4">
          <h4 className="text-xl font-bold mb-2">Available Time Slots (24h)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hourlySlots.map((slot, idx) => (
              <div key={idx} className={`p-3 rounded-lg border transition-all duration-200 flex flex-col justify-between ${slot.available ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-100 opacity-60"} ${selectedSlots.includes(idx) ? "ring-4 ring-green-500" : ""}`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">{slot.time}</span>
                  <span className="text-green-700 font-bold">₹{slot.price}</span>
                </div>
                <div className="flex items-center mt-2">
                  <Badge className={slot.available ? "bg-green-500 text-white" : "bg-gray-400 text-white"}>
                    {slot.available ? "Available" : "Booked"}
                  </Badge>
                </div>
                <Button
                  className={`mt-3 w-full border-2 border-green-600 font-bold transition-all duration-200 ${selectedSlots.includes(idx)
                    ? "bg-green-600 text-white shadow-lg scale-105 ring-2 ring-green-700"
                    : "bg-green-700 text-green-800 hover:bg-green-400 border-green-600"}`}
                  style={{ visibility: slot.available ? "visible" : "hidden", opacity: slot.available ? 1 : 0.5 }}
                  variant={slot.available ? "default" : "outline"}
                  disabled={!slot.available}
                  onClick={() => toggleSlot(idx)}
                >
                  {selectedSlots.includes(idx)
                    ? <span className="flex items-center justify-center"><CheckCircle className="mr-2 h-5 w-5" /> Selected</span>
                    : <span className="font-bold">Select</span>}
                </Button>
              </div>
            ))}
          </div>
        </div>
        {selectedSlots.length > 0 && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-300">
            <h4 className="text-lg font-bold mb-2">Selected Booking Details</h4>
            <div>
              Date: <span className="font-semibold">
                {selectedRange && selectedRange[0] instanceof Date && selectedRange[1] instanceof Date
                  ? `${selectedRange[0].toLocaleDateString()} - ${selectedRange[1].toLocaleDateString()}`
                  : selectedDate instanceof Date && typeof selectedDate.toLocaleDateString === "function"
                    ? selectedDate.toLocaleDateString()
                    : "No date selected"}
              </span>
            </div>
            <div>Time Slots:</div>
            <ul className="list-disc ml-6">
              {selectedSlots.map((idx) => (
                <li key={idx}>{hourlySlots[idx].time}</li>
              ))}
            </ul>
            <div className="mt-2 font-bold text-green-700">Total Price: ₹{totalPrice}</div>
            <Button
              className="mt-3 bg-green-600 text-white font-bold"
              onClick={() => {
                // Prepare booking details for payment page
                const dateStr = selectedRange
                  ? `${selectedRange[0]?.toLocaleDateString()} - ${selectedRange[1]?.toLocaleDateString()}`
                  : selectedDate?.toLocaleDateString();
                const slotsStr = selectedSlots.map(idx => hourlySlots[idx].time).join(", ");
                const params = new URLSearchParams({
                  tid: turf.id,
                  name: turf.name,
                  price: totalPrice,
                  date: dateStr,
                  slots: slotsStr,
                });
                navigate(`/payment?${params.toString()}`);
              }}
            >
              Book Now
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default TurfDetailsModal;
