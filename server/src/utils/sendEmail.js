import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const createTransporter = () => {
  // For development - using Gmail SMTP
  if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_SERVICE) {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  // For production - using dedicated email service
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Main email function - supports both old (to, subject, html) and new (options) API styles
export const sendEmail = async (to, subject, html) => {
  let options;
  
  // Handle both API styles for backward compatibility
  if (typeof to === 'object' && to !== null) {
    // New options-based API
    options = to;
  } else {
    // Old parameter-based API
    options = { email: to, subject, message: html };
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"TurfHub" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.email || options.to,
      subject: options.subject,
      html: options.message || options.html,
    };

    // For development, just log the email instead of sending
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      console.log('📧 Email would be sent:');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Message:', mailOptions.html);
      return { messageId: 'dev-mode-' + Date.now() };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Legacy function alias for enhanced email functionality
export const sendEnhancedEmail = async (options) => {
  return await sendEmail(options);
};
