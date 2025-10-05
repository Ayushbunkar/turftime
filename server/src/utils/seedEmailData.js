import EmailCampaign from '../models/EmailCampaign.js';
import EmailTemplate from '../models/EmailTemplate.js';
import User from '../models/userModel.js';

export const seedEmailData = async () => {
  try {
    // Check if data already exists
    const existingCampaigns = await EmailCampaign.countDocuments();
    const existingTemplates = await EmailTemplate.countDocuments();
    
    if (existingCampaigns > 0 && existingTemplates > 0) {
      console.log('✅ Email data already exists, skipping seed...');
      return;
    }

    // Find admin user
    const admin = await User.findOne({ role: { $in: ['admin', 'superAdmin'] } });
    
    if (!admin) {
      console.log('⚠️  No admin user found. Please create an admin user first.');
      return;
    }

    // Seed Email Templates
    if (existingTemplates === 0) {
      const templates = [
        {
          name: 'Welcome Email',
          subject: 'Welcome to TurfOwn - Your Sports Booking Platform',
          content: `
            <h1>Welcome to TurfOwn, {{userName}}!</h1>
            <p>Thank you for joining our platform. We're excited to help you book the best sports turfs in your area.</p>
            <p>Get started by browsing available turfs and making your first booking.</p>
            <a href="{{dashboardLink}}">Go to Dashboard</a>
          `,
          category: 'onboarding',
          variables: ['userName', 'dashboardLink'],
          createdBy: admin._id,
          usageCount: 156
        },
        {
          name: 'Booking Confirmation',
          subject: 'Booking Confirmed - {{turfName}}',
          content: `
            <h1>Booking Confirmed!</h1>
            <p>Hi {{userName}},</p>
            <p>Your booking for {{turfName}} has been confirmed.</p>
            <p><strong>Booking Details:</strong></p>
            <ul>
              <li>Date: {{bookingDate}}</li>
              <li>Time: {{bookingTime}}</li>
              <li>Amount: {{amount}}</li>
            </ul>
            <p>See you at the turf!</p>
          `,
          category: 'transactional',
          variables: ['userName', 'turfName', 'bookingDate', 'bookingTime', 'amount'],
          createdBy: admin._id,
          usageCount: 1245
        },
        {
          name: 'Payment Receipt',
          subject: 'Payment Receipt - Order {{orderId}}',
          content: `
            <h1>Payment Received</h1>
            <p>Hi {{userName}},</p>
            <p>We have received your payment for booking #{{orderId}}.</p>
            <p><strong>Payment Details:</strong></p>
            <ul>
              <li>Amount: {{amount}}</li>
              <li>Payment Method: {{paymentMethod}}</li>
              <li>Transaction ID: {{transactionId}}</li>
            </ul>
            <p>Thank you for your payment!</p>
          `,
          category: 'transactional',
          variables: ['userName', 'orderId', 'amount', 'paymentMethod', 'transactionId'],
          createdBy: admin._id,
          usageCount: 1198
        },
        {
          name: 'Password Reset',
          subject: 'Reset Your Password - TurfOwn',
          content: `
            <h1>Password Reset Request</h1>
            <p>Hi {{userName}},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="{{resetLink}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          `,
          category: 'notification',
          variables: ['userName', 'resetLink'],
          createdBy: admin._id,
          usageCount: 89
        },
        {
          name: 'Monthly Newsletter',
          subject: 'TurfOwn Newsletter - {{month}}',
          content: `
            <h1>Monthly Newsletter</h1>
            <p>Hi {{userName}},</p>
            <p>Here's what's new this month at TurfOwn:</p>
            <h2>New Turfs Added</h2>
            <p>We've added {{newTurfsCount}} new turfs in your area!</p>
            <h2>Special Offers</h2>
            <p>Get 20% off on your next booking with code: {{promoCode}}</p>
            <p>Happy playing!</p>
          `,
          category: 'marketing',
          variables: ['userName', 'month', 'newTurfsCount', 'promoCode'],
          createdBy: admin._id,
          usageCount: 3
        },
        {
          name: 'Booking Reminder',
          subject: 'Reminder: Your Booking Tomorrow',
          content: `
            <h1>Booking Reminder</h1>
            <p>Hi {{userName}},</p>
            <p>This is a friendly reminder about your upcoming booking:</p>
            <p><strong>{{turfName}}</strong></p>
            <p>Date: {{bookingDate}}</p>
            <p>Time: {{bookingTime}}</p>
            <p>Don't forget to arrive 15 minutes early!</p>
          `,
          category: 'notification',
          variables: ['userName', 'turfName', 'bookingDate', 'bookingTime'],
          createdBy: admin._id,
          usageCount: 567
        }
      ];

      await EmailTemplate.insertMany(templates);
      console.log(`✅ Created ${templates.length} email templates`);
    }

    // Seed Email Campaigns
    if (existingCampaigns === 0) {
      const campaigns = [
        {
          name: 'Welcome Campaign 2025',
          subject: 'Welcome to TurfOwn!',
          content: 'Welcome email content...',
          status: 'sent',
          recipientType: 'users',
          stats: {
            sent: 1245,
            delivered: 1198,
            opened: 820,
            clicked: 152,
            bounced: 47,
            unsubscribed: 12
          },
          createdBy: admin._id,
          sentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
        },
        {
          name: 'Summer Special Offers',
          subject: 'Get 30% Off on All Bookings!',
          content: 'Special offers email content...',
          status: 'sent',
          recipientType: 'all',
          stats: {
            sent: 2340,
            delivered: 2298,
            opened: 1563,
            clicked: 287,
            bounced: 42,
            unsubscribed: 18
          },
          createdBy: admin._id,
          sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
        },
        {
          name: 'New Turfs in Your Area',
          subject: 'Check Out Our Newest Turfs',
          content: 'New turfs announcement...',
          status: 'sent',
          recipientType: 'users',
          stats: {
            sent: 890,
            delivered: 875,
            opened: 532,
            clicked: 89,
            bounced: 15,
            unsubscribed: 3
          },
          createdBy: admin._id,
          sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        },
        {
          name: 'Turf Admin Onboarding',
          subject: 'Welcome Turf Admins - Get Started',
          content: 'Turf admin onboarding content...',
          status: 'sent',
          recipientType: 'turfAdmins',
          stats: {
            sent: 45,
            delivered: 45,
            opened: 38,
            clicked: 22,
            bounced: 0,
            unsubscribed: 0
          },
          createdBy: admin._id,
          sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        {
          name: 'Weekend Booking Reminder',
          subject: 'Book Your Weekend Slots Now!',
          content: 'Weekend booking reminder...',
          status: 'scheduled',
          recipientType: 'users',
          scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          stats: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0
          },
          createdBy: admin._id
        },
        {
          name: 'Monthly Newsletter January',
          subject: 'TurfOwn January Newsletter',
          content: 'Monthly newsletter content...',
          status: 'draft',
          recipientType: 'all',
          stats: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0
          },
          createdBy: admin._id
        }
      ];

      await EmailCampaign.insertMany(campaigns);
      console.log(`✅ Created ${campaigns.length} email campaigns`);
    }

    console.log('✅ Successfully seeded email data!');
    
  } catch (error) {
    console.error('❌ Error seeding email data:', error.message);
  }
};

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../config/db.js').then(async ({ default: connectDB }) => {
    await connectDB();
    await seedEmailData();
    process.exit(0);
  });
}
