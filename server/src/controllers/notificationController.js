import Notification from '../models/Notification.js';
import User from '../models/userModel.js';
import Admin from '../models/Admin.js';
import { sendEmail } from '../utils/sendEmailNew.js';
import catchAsync from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

// ==================== NOTIFICATION TEMPLATES ====================

const notificationTemplates = {
  booking_confirmed: {
    title: 'Booking Confirmed',
    emailTemplate: (data) => `
      <h2>🎉 Booking Confirmed!</h2>
      <p>Hi ${data.userName},</p>
      <p>Your turf booking has been confirmed!</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📋 Booking Details</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>🏟️ Turf:</strong> ${data.turfName}</li>
          <li><strong>📅 Date:</strong> ${data.bookingDate}</li>
          <li><strong>🕐 Time:</strong> ${data.timeSlot}</li>
          <li><strong>💰 Amount:</strong> ₹${data.amount}</li>
          <li><strong>🔖 Booking ID:</strong> ${data.bookingId}</li>
        </ul>
      </div>
      
      <p>Please arrive 10 minutes before your booking time.</p>
      <p style="color: #666;">If you need to cancel, please do so at least 24 hours in advance.</p>
      
      <div style="margin: 30px 0;">
        <a href="${data.actionUrl}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Booking</a>
      </div>
      
      <p>Best regards,<br>TurfHub Team</p>
    `,
    smsTemplate: (data) => `TurfHub: Your booking for ${data.turfName} on ${data.bookingDate} at ${data.timeSlot} is confirmed. Amount: ₹${data.amount}. ID: ${data.bookingId}`,
    pushTemplate: (data) => ({
      title: '🎉 Booking Confirmed!',
      body: `Your booking for ${data.turfName} on ${data.bookingDate} is confirmed!`,
      icon: '/icons/booking-confirmed.png'
    })
  },
  
  booking_cancelled: {
    title: 'Booking Cancelled',
    emailTemplate: (data) => `
      <h2>❌ Booking Cancelled</h2>
      <p>Hi ${data.userName},</p>
      <p>Your booking has been cancelled.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📋 Cancelled Booking Details</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>🏟️ Turf:</strong> ${data.turfName}</li>
          <li><strong>📅 Date:</strong> ${data.bookingDate}</li>
          <li><strong>🕐 Time:</strong> ${data.timeSlot}</li>
          <li><strong>🔖 Booking ID:</strong> ${data.bookingId}</li>
          ${data.reason ? `<li><strong>📝 Reason:</strong> ${data.reason}</li>` : ''}
        </ul>
      </div>
      
      ${data.refundAmount ? `<p>💰 A refund of ₹${data.refundAmount} has been initiated and will be processed within 5-7 business days.</p>` : ''}
      
      <div style="margin: 30px 0;">
        <a href="${data.actionUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Book Another Turf</a>
      </div>
      
      <p>Best regards,<br>TurfHub Team</p>
    `,
    smsTemplate: (data) => `TurfHub: Your booking ${data.bookingId} for ${data.turfName} has been cancelled. ${data.refundAmount ? `Refund: ₹${data.refundAmount}` : ''}`,
    pushTemplate: (data) => ({
      title: '❌ Booking Cancelled',
      body: `Your booking for ${data.turfName} has been cancelled`,
      icon: '/icons/booking-cancelled.png'
    })
  },
  
  payment_success: {
    title: 'Payment Successful',
    emailTemplate: (data) => `
      <h2>✅ Payment Successful</h2>
      <p>Hi ${data.userName},</p>
      <p>Your payment has been processed successfully!</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>💳 Payment Details</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>💰 Amount:</strong> ₹${data.amount}</li>
          <li><strong>🔖 Payment ID:</strong> ${data.paymentId}</li>
          <li><strong>🏟️ Turf:</strong> ${data.turfName}</li>
          <li><strong>📅 Date:</strong> ${data.bookingDate}</li>
        </ul>
      </div>
      
      <p>Your booking is now confirmed and you're all set!</p>
      
      <div style="margin: 30px 0;">
        <a href="${data.actionUrl}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Booking</a>
      </div>
      
      <p>Best regards,<br>TurfHub Team</p>
    `,
    smsTemplate: (data) => `TurfHub: Payment of ₹${data.amount} successful. Your booking for ${data.turfName} is confirmed. Payment ID: ${data.paymentId}`,
    pushTemplate: (data) => ({
      title: '✅ Payment Successful',
      body: `Payment of ₹${data.amount} processed successfully!`,
      icon: '/icons/payment-success.png'
    })
  },

  turf_approved: {
    title: 'Turf Approved',
    emailTemplate: (data) => `
      <h2>🎉 Turf Approved!</h2>
      <p>Hi ${data.adminName},</p>
      <p>Great news! Your turf has been approved and is now live on TurfHub.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>🏟️ Approved Turf</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Name:</strong> ${data.turfName}</li>
          <li><strong>Location:</strong> ${data.location}</li>
          <li><strong>Status:</strong> Active</li>
        </ul>
      </div>
      
      <p>Your turf is now visible to customers and ready to receive bookings!</p>
      
      <div style="margin: 30px 0;">
        <a href="${data.actionUrl}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Manage Turf</a>
      </div>
      
      <p>Best regards,<br>TurfHub Team</p>
    `,
    smsTemplate: (data) => `TurfHub: Your turf "${data.turfName}" has been approved and is now live! Start receiving bookings today.`,
    pushTemplate: (data) => ({
      title: '🎉 Turf Approved!',
      body: `Your turf "${data.turfName}" is now live and ready for bookings!`,
      icon: '/icons/turf-approved.png'
    })
  },

  admin_approved: {
    title: 'Admin Account Approved',
    emailTemplate: (data) => `
      <h2>🎉 Welcome to TurfHub!</h2>
      <p>Hi ${data.adminName},</p>
      <p>Your admin account has been approved! You can now start adding and managing your turfs.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📋 Next Steps</h3>
        <ol>
          <li>Log in to your admin dashboard</li>
          <li>Add your first turf</li>
          <li>Set up your availability and pricing</li>
          <li>Start receiving bookings!</li>
        </ol>
      </div>
      
      <div style="margin: 30px 0;">
        <a href="${data.actionUrl}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Dashboard</a>
      </div>
      
      <p>If you have any questions, our support team is here to help.</p>
      
      <p>Best regards,<br>TurfHub Team</p>
    `,
    smsTemplate: (data) => `TurfHub: Your admin account has been approved! Log in now to start adding your turfs and receiving bookings.`,
    pushTemplate: (data) => ({
      title: '🎉 Account Approved!',
      body: 'Your admin account is approved. Start adding turfs now!',
      icon: '/icons/admin-approved.png'
    })
  },

  reminder: {
    title: 'Booking Reminder',
    emailTemplate: (data) => `
      <h2>⏰ Booking Reminder</h2>
      <p>Hi ${data.userName},</p>
      <p>This is a reminder that you have an upcoming turf booking!</p>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📋 Upcoming Booking</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>🏟️ Turf:</strong> ${data.turfName}</li>
          <li><strong>📅 Date:</strong> ${data.bookingDate}</li>
          <li><strong>🕐 Time:</strong> ${data.timeSlot}</li>
          <li><strong>📍 Location:</strong> ${data.location}</li>
        </ul>
      </div>
      
      <p>⚠️ Please arrive 10 minutes before your booking time.</p>
      <p>Don't forget to bring your sports gear and valid ID!</p>
      
      <div style="margin: 30px 0;">
        <a href="${data.actionUrl}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a>
      </div>
      
      <p>Looking forward to seeing you on the turf!</p>
      
      <p>Best regards,<br>TurfHub Team</p>
    `,
    smsTemplate: (data) => `TurfHub Reminder: Your booking for ${data.turfName} is ${data.timeUntil}. Time: ${data.timeSlot}. Please arrive 10 mins early!`,
    pushTemplate: (data) => ({
      title: '⏰ Booking Reminder',
      body: `Your booking for ${data.turfName} is ${data.timeUntil}!`,
      icon: '/icons/reminder.png'
    })
  }
};

// ==================== NOTIFICATION SERVICE ====================

class NotificationService {
  // Create and send notification
  static async createAndSend(recipientId, type, data, options = {}) {
    try {
      // Get recipient details
      let recipient = await User.findById(recipientId);
      let recipientType = 'user';
      
      if (!recipient) {
        recipient = await Admin.findById(recipientId);
        recipientType = 'admin';
      }
      
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      // Get template
      const template = notificationTemplates[type];
      if (!template) {
        throw new Error(`Template not found for type: ${type}`);
      }

      // Create notification record
      const notification = new Notification({
        recipient: recipientId,
        recipientType,
        title: template.title,
        message: template.emailTemplate ? template.emailTemplate(data) : data.message,
        type,
        priority: options.priority || 'medium',
        channels: {
          email: { enabled: options.email !== false },
          sms: { enabled: options.sms === true },
          push: { enabled: options.push !== false },
          inApp: { enabled: options.inApp !== false }
        },
        metadata: data.metadata || {},
        scheduledFor: options.scheduledFor || new Date(),
        expiresAt: options.expiresAt,
        template: {
          name: type,
          variables: data
        }
      });

      await notification.save();

      // Send immediately if not scheduled
      if (!options.scheduledFor || options.scheduledFor <= new Date()) {
        await this.sendNotification(notification, recipient, template, data);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send notification via all enabled channels
  static async sendNotification(notification, recipient, template, data) {
    const results = {
      email: null,
      sms: null,
      push: null,
      inApp: true // In-app is always successful as it's stored in DB
    };

    // Send email
    if (notification.channels.email.enabled && template.emailTemplate) {
      try {
        await sendEmail({
          email: recipient.email,
          subject: `TurfHub - ${notification.title}`,
          message: template.emailTemplate(data)
        });
        
        await notification.updateDeliveryStatus('email', 'sent');
        results.email = 'sent';
      } catch (error) {
        console.error('Email sending failed:', error);
        await notification.updateDeliveryStatus('email', 'failed', error.message);
        results.email = 'failed';
      }
    }

    // Send SMS (placeholder - integrate with SMS provider)
    if (notification.channels.sms.enabled && template.smsTemplate) {
      try {
        // TODO: Integrate with SMS provider (Twilio, etc.)
        console.log('SMS would be sent:', template.smsTemplate(data));
        await notification.updateDeliveryStatus('sms', 'sent');
        results.sms = 'sent';
      } catch (error) {
        console.error('SMS sending failed:', error);
        await notification.updateDeliveryStatus('sms', 'failed', error.message);
        results.sms = 'failed';
      }
    }

    // Send push notification (placeholder - integrate with Firebase/OneSignal)
    if (notification.channels.push.enabled && template.pushTemplate) {
      try {
        // TODO: Integrate with push notification provider
        console.log('Push notification would be sent:', template.pushTemplate(data));
        await notification.updateDeliveryStatus('push', 'sent');
        results.push = 'sent';
      } catch (error) {
        console.error('Push notification failed:', error);
        await notification.updateDeliveryStatus('push', 'failed', error.message);
        results.push = 'failed';
      }
    }

    // Update overall status
    notification.status = 'sent';
    await notification.save();

    return results;
  }

  // Process scheduled notifications
  static async processScheduledNotifications() {
    try {
      const scheduledNotifications = await Notification.find({
        status: 'pending',
        scheduledFor: { $lte: new Date() }
      }).populate('recipient');

      for (const notification of scheduledNotifications) {
        const template = notificationTemplates[notification.type];
        if (template && notification.recipient) {
          await this.sendNotification(
            notification,
            notification.recipient,
            template,
            notification.template.variables
          );
        }
      }

      console.log(`✅ Processed ${scheduledNotifications.length} scheduled notifications`);
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
    }
  }

  // Send bulk notifications
  static async sendBulkNotification(recipientIds, type, data, options = {}) {
    const results = [];
    
    for (const recipientId of recipientIds) {
      try {
        const notification = await this.createAndSend(recipientId, type, data, options);
        results.push({ recipientId, success: true, notificationId: notification._id });
      } catch (error) {
        console.error(`Failed to send notification to ${recipientId}:`, error);
        results.push({ recipientId, success: false, error: error.message });
      }
    }

    return results;
  }
}

export default NotificationService;

// ==================== NOTIFICATION CONTROLLERS ====================

/**
 * Get notifications for authenticated user
 */
export const getUserNotifications = catchAsync(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    type = 'all',
    read = 'all',
    priority = 'all'
  } = req.query;

  // Build filter
  const filter = { recipient: req.user.id };
  
  if (type !== 'all') {
    filter.type = type;
  }
  if (read !== 'all') {
    filter['channels.inApp.read'] = read === 'true';
  }
  if (priority !== 'all') {
    filter.priority = priority;
  }

  const notifications = await Notification.find(filter)
    .select('title message type priority channels.inApp createdAt metadata')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    'channels.inApp.read': false
  });

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      }
    }
  });
});

/**
 * Mark notification as read
 */
export const markNotificationAsRead = catchAsync(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: req.user.id
  });

  if (!notification) {
    return res.status(404).json({
      status: 'error',
      message: 'Notification not found'
    });
  }

  await notification.markAsRead();

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read'
  });
});

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id },
    { 
      'channels.inApp.read': true,
      'channels.inApp.readAt': new Date()
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

/**
 * Delete notification
 */
export const deleteNotification = catchAsync(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: req.user.id
  });

  if (!notification) {
    return res.status(404).json({
      status: 'error',
      message: 'Notification not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Notification deleted'
  });
});

/**
 * Create manual notification (admin only)
 */
export const createManualNotification = catchAsync(async (req, res) => {
  const { recipientIds, type, data, options } = req.body;

  if (!recipientIds || !type || !data) {
    return res.status(400).json({
      status: 'error',
      message: 'recipientIds, type, and data are required'
    });
  }

  // Send to single or multiple recipients
  let results;
  if (Array.isArray(recipientIds)) {
    results = await NotificationService.sendBulkNotification(recipientIds, type, data, options);
  } else {
    const notification = await NotificationService.createAndSend(recipientIds, type, data, options);
    results = [{ recipientId: recipientIds, success: true, notificationId: notification._id }];
  }

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  res.status(200).json({
    status: 'success',
    message: `Notifications sent: ${successCount} successful, ${failureCount} failed`,
    data: results
  });
});

/**
 * Get notification statistics (admin only)
 */
export const getNotificationStats = catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }

  const stats = await Notification.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    }
  ]);

  // Format stats
  const formattedStats = {
    totalSent: 0,
    byType: {},
    byStatus: {},
    deliveryRates: {
      email: { sent: 0, delivered: 0, failed: 0 },
      sms: { sent: 0, delivered: 0, failed: 0 },
      push: { sent: 0, delivered: 0, failed: 0 }
    }
  };

  stats.forEach(stat => {
    formattedStats.totalSent += stat.count;
    
    if (!formattedStats.byType[stat._id.type]) {
      formattedStats.byType[stat._id.type] = 0;
    }
    formattedStats.byType[stat._id.type] += stat.count;
    
    if (!formattedStats.byStatus[stat._id.status]) {
      formattedStats.byStatus[stat._id.status] = 0;
    }
    formattedStats.byStatus[stat._id.status] += stat.count;
  });

  res.status(200).json({
    status: 'success',
    data: {
      period,
      stats: formattedStats
    }
  });
});