import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    document.body.appendChild(script);
  });

const Payment = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tid = params.get("tid");
  const name = params.get("name");
  const price = params.get("price");
  const date = params.get("date");
  const slots = params.get("slots");

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Use Razorpay key from env, fallback to dummy if not set
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_dummykey12345";

  const handlePay = async () => {
    await loadRazorpayScript();

    if (!razorpayKey || !price || isNaN(Number(price))) {
      alert("Payment cannot be initiated. Please check your Razorpay key and price.");
      return;
    }

    const options = {
      key: razorpayKey, // Use env key
      amount: Number(price) * 100, // Amount in paise
      currency: "INR",
      name: name,
      description: `Booking for ${slots} on ${date}`,
      handler: function (response) {
        alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
        // You can redirect or call your backend here
      },
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
      notes: {
        booking_date: date,
        slots: slots,
      },
      theme: {
        color: "#22c55e",
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      alert("Failed to open Razorpay checkout. Please check your configuration.");
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center animate-fadein"
        style={{
          animation: "fadein 0.7s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 shadow">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-green-700 mb-2 tracking-tight">Complete Your Payment</h2>
        <div className="text-gray-600 mb-8 text-lg">Secure booking for <span className="font-semibold text-green-700">{name}</span></div>
        <div className="w-full flex flex-col gap-3 mb-8">
          <div className="flex justify-between text-gray-700 text-base">
            <span className="font-medium">Date:</span>
            <span className="font-mono">{date}</span>
          </div>
          <div className="flex justify-between text-gray-700 text-base">
            <span className="font-medium">Slots:</span>
            <span className="font-mono">{slots}</span>
          </div>
          <div className="flex justify-between text-green-700 text-xl font-bold border-t pt-4 mt-2">
            <span>Total Amount:</span>
            <span>₹{price}</span>
          </div>
        </div>
        <button
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105"
          onClick={handlePay}
        >
          Pay with Razorpay
        </button>
      </div>
      <style>
        {`
          @keyframes fadein {
            from { opacity: 0; transform: translateY(40px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
};

export default Payment;
