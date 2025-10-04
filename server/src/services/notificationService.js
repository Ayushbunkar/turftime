import nodemailer from 'nodemailer';
// import twilio from 'twilio'; // Uncomment when Twilio is needed
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Notification Service Configuration
 * 
 * Required Environment Variables:
 * - SMTP_HOST, SMTP_USER, SMTP_PASSWORD (for email)
 * - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER (for SMS - optional)
 * 
 * To enable Twilio SMS:
 * 1. npm install twilio
 * 2. Uncomment twilio import above
 * 3. Uncomment createSMSClient function
 * 4. Uncomment Twilio SMS sending code in sendSMSNotification
 * 5. Add Twilio credentials to .env file
 */

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Twilio SMS client configuration (commented out)
// const createSMSClient = () => {
//   if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
//     return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
//   }
//   return null;
// };

// SMS fallback - stores SMS in database/logs instead of sending
const storeSMSNotification = async (phoneNumber, message, type) => {
  try {
    // Store in database or log file for now
    console.log('📱 SMS Notification (Not Sent - Twilio Disabled):');
    console.log(`📞 To: ${phoneNumber}`);
    console.log(`📝 Type: ${type}`);
    console.log(`💬 Message: ${message}`);
    console.log('---');
    
    // You can store this in a notifications collection for admin viewing
    return { success: true, message: 'SMS stored in logs' };
  } catch (error) {
    console.error('Error storing SMS notification:', error);
    return { success: false, message: error.message };
  }
};

// Email templates
const getEmailTemplate = (type, data) => {
  const baseStyle = `
    <style>
      .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
      .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
      .content { padding: 20px; }
      .booking-details { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
      .footer { background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
      .button { display: inline-block; background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
  `;

  switch (type) {
    case 'booking_confirmation':
      return `
        ${baseStyle}
        <div class="email-container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Your turf booking has been successfully confirmed. Here are the details:</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <p><strong>Booking Reference:</strong> ${data.bookingRef}</p>
              <p><strong>Turf:</strong> ${data.turfName}</p>
              <p><strong>Location:</strong> ${data.turfLocation}</p>
              <p><strong>Date:</strong> ${new Date(data.bookingDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${data.timeSlots}</p>
              <p><strong>Duration:</strong> ${data.duration} hour(s)</p>
              <p><strong>Total Amount:</strong> ₹${data.totalPrice}</p>
              <p><strong>Payment Status:</strong> ${data.paymentStatus}</p>
            </div>

            ${data.specialRequests ? `<p><strong>Special Requests:</strong> ${data.specialRequests}</p>` : ''}
            
            <p>Please arrive 15 minutes before your scheduled time. Don't forget to bring your sports gear!</p>
            
            <p><strong>Contact Information:</strong></p>
            <p>Phone: ${data.contactPhone}</p>
            <p>Email: ${data.contactEmail}</p>
            
            <p>Need to cancel? You can cancel up to 2 hours before your booking time.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing TurfTime!</p>
            <p>For support, contact us at support@turftime.com or call +91-XXXXX-XXXXX</p>
          </div>
        </div>
      `;

    case 'booking_cancelled':
      return `
        ${baseStyle}
        <div class="email-container">
          <div class="header" style="background-color: #EF4444;">
            <h1>Booking Cancelled</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Your turf booking has been cancelled as requested.</p>
            
            <div class="booking-details">
              <h3>Cancelled Booking Details</h3>
              <p><strong>Booking Reference:</strong> ${data.bookingRef}</p>
              <p><strong>Turf:</strong> ${data.turfName}</p>
              <p><strong>Date:</strong> ${new Date(data.bookingDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${data.timeSlots}</p>
              <p><strong>Cancellation Date:</strong> ${new Date(data.cancellationDate).toLocaleDateString()}</p>
              <p><strong>Reason:</strong> ${data.cancellationReason}</p>
            </div>

            ${data.refundAmount > 0 ? `
              <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h3 style="color: #16a34a;">Refund Information</h3>
                <p><strong>Refund Amount:</strong> ₹${data.refundAmount}</p>
                <p>The refund will be processed within 3-5 business days to your original payment method.</p>
              </div>
            ` : '<p>No refund is applicable for this cancellation.</p>'}
            
            <p>We're sorry to see you cancel your booking. We hope to serve you again soon!</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing TurfTime!</p>
          </div>
        </div>
      `;

    case 'booking_reminder':
      return `
        ${baseStyle}
        <div class="email-container">
          <div class="header" style="background-color: #F59E0B;">
            <h1>Booking Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>This is a friendly reminder about your upcoming turf booking:</p>
            
            <div class="booking-details">
              <h3>Your Booking</h3>
              <p><strong>Turf:</strong> ${data.turfName}</p>
              <p><strong>Date:</strong> ${new Date(data.bookingDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${data.timeSlots}</p>
              <p><strong>Duration:</strong> ${data.duration} hour(s)</p>
            </div>
            
            <p><strong>Important Reminders:</strong></p>
            <ul>
              <li>Arrive 15 minutes before your scheduled time</li>
              <li>Bring appropriate sports gear and footwear</li>
              <li>Contact us if you need to make any changes</li>
            </ul>
            
            <p>Looking forward to seeing you on the turf!</p>
          </div>
          <div class="footer">
            <p>TurfTime - Your Sports Booking Platform</p>
          </div>
        </div>
      `;

    default:
      return '<p>Email template not found</p>';
  }
};

// SMS templates
const getSMSTemplate = (type, data) => {
  switch (type) {
    case 'booking_confirmation':
      return `TurfTime: Booking confirmed! Ref: ${data.bookingRef}. ${data.turfName} on ${new Date(data.bookingDate).toLocaleDateString()} at ${data.timeSlots}. Total: ₹${data.totalPrice}. See you on the turf!`;

    case 'booking_cancelled':
      return `TurfTime: Booking ${data.bookingRef} cancelled. ${data.refundAmount > 0 ? `Refund of ₹${data.refundAmount} will be processed in 3-5 days.` : 'No refund applicable.'} Thank you.`;

    case 'booking_reminder':
      return `TurfTime Reminder: You have a booking today at ${data.turfName} from ${data.timeSlots}. Arrive 15 mins early. Enjoy your game!`;

    case 'payment_pending':
      return `TurfTime: Payment pending for booking ${data.bookingRef}. Please complete payment to confirm your slot at ${data.turfName}.`;

    default:
      return 'TurfTime notification';
  }
};

// Send email notification
export const sendEmailNotification = asyncHandler(async (type, data) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('Email configuration not found, skipping email notification');
      return { success: false, message: 'Email not configured' };
    }

    const transporter = createEmailTransporter();
    const htmlContent = getEmailTemplate(type, data);
    
    let subject = 'TurfTime Notification';
    switch (type) {
      case 'booking_confirmation':
        subject = `Booking Confirmed - ${data.bookingRef}`;
        break;
      case 'booking_cancelled':
        subject = `Booking Cancelled - ${data.bookingRef}`;
        break;
      case 'booking_reminder':
        subject = `Reminder: Your booking today at ${data.turfName}`;
        break;
    }

    const mailOptions = {
      from: `"TurfTime" <${process.env.SMTP_USER}>`,
      to: data.contactEmail,
      subject: subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent: ${type} to ${data.contactEmail}`);
    
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: error.message };
  }
});

// Send SMS notification (Fallback implementation)
export const sendSMSNotification = asyncHandler(async (type, data) => {
  try {
    const message = getSMSTemplate(type, data);
    
    // Format phone number
    let phoneNumber = data.contactPhone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+91' + phoneNumber.replace(/^0+/, ''); // Assuming India (+91)
    }

    // OPTION 1: Use fallback SMS storage (current implementation)
    const result = await storeSMSNotification(phoneNumber, message, type);
    
    // OPTION 2: Uncomment below for actual Twilio SMS sending
    /*
    const twilioClient = createSMSClient();
    
    if (!twilioClient) {
      console.log('SMS configuration not found, using fallback');
      const result = await storeSMSNotification(phoneNumber, message, type);
      return result;
    }

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`SMS notification sent via Twilio: ${type} to ${phoneNumber}`);
    return { success: true, message: 'SMS sent successfully via Twilio' };
    */
    
    if (result.success) {
      console.log(`SMS notification logged: ${type} to ${phoneNumber}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error processing SMS notification:', error);
    return { success: false, message: error.message };
  }
});

// Send combined notification (email + SMS)
export const sendCombinedNotification = asyncHandler(async (type, data) => {
  const results = {
    email: { success: false },
    sms: { success: false }
  };

  // Send email notification
  try {
    results.email = await sendEmailNotification(type, data);
  } catch (error) {
    results.email = { success: false, message: error.message };
  }

  // Send SMS notification
  try {
    results.sms = await sendSMSNotification(type, data);
  } catch (error) {
    results.sms = { success: false, message: error.message };
  }

  return results;
});

// Schedule reminder notifications
export const scheduleBookingReminder = (booking) => {
  const bookingDateTime = new Date(`${booking.bookingDate}T${booking.startTime}`);
  const reminderTime = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
  const now = new Date();

  if (reminderTime > now) {
    const delay = reminderTime.getTime() - now.getTime();
    
    setTimeout(async () => {
      // Check if booking still exists and is confirmed
      const Booking = mongoose.models.Booking;
      const currentBooking = await Booking.findById(booking._id);
      
      if (currentBooking && currentBooking.status === 'confirmed') {
        const reminderData = {
          customerName: currentBooking.contactName,
          bookingRef: currentBooking.bookingRef || `TRF-${currentBooking._id.toString().slice(-6).toUpperCase()}`,
          turfName: currentBooking.turf?.name || 'Turf',
          bookingDate: currentBooking.bookingDate,
          timeSlots: `${currentBooking.startTime} - ${currentBooking.endTime}`,
          duration: currentBooking.duration,
          contactEmail: currentBooking.contactEmail,
          contactPhone: currentBooking.contactPhone
        };
        
        await sendCombinedNotification('booking_reminder', reminderData);
      }
    }, delay);
    
    console.log(`Reminder scheduled for booking ${booking._id} at ${reminderTime}`);
  }
};

export default {
  sendEmailNotification,
  sendSMSNotification,
  sendCombinedNotification,
  scheduleBookingReminder
};