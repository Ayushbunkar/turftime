import SupportTicket from '../models/SupportTicket.js';
import User from '../models/userModel.js';

export const seedSupportTickets = async () => {
  try {
    // Check if tickets already exist
    const existingTickets = await SupportTicket.countDocuments();
    if (existingTickets > 0) {
      console.log('✅ Support tickets already exist, skipping seed...');
      return;
    }

    // Find some users to create tickets for
    const users = await User.find({ role: 'user' }).limit(5);
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Please create users first before seeding support tickets.');
      return;
    }

    // Find admin users for assignment
    const admins = await User.find({ role: { $in: ['admin', 'superAdmin'] } }).limit(3);

    const sampleTickets = [
      {
        user: users[0]._id,
        subject: 'Unable to complete booking payment',
        description: 'I am trying to book a turf for tomorrow evening, but the payment gateway keeps showing an error. I have tried multiple times with different payment methods but the issue persists. Please help resolve this urgently.',
        category: 'payment',
        priority: 'high',
        status: 'open',
        responses: []
      },
      {
        user: users[1]?._id || users[0]._id,
        subject: 'Turf location showing incorrect address',
        description: 'The turf I booked is showing a different location on the map compared to the actual address. This caused me to go to the wrong place. Please update the correct coordinates.',
        category: 'technical',
        priority: 'medium',
        status: 'in-progress',
        assignedTo: admins[0]?._id,
        responses: [
          {
            from: 'support',
            message: 'Thank you for reporting this issue. We are looking into the location coordinates and will update them shortly. We apologize for the inconvenience.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          }
        ]
      },
      {
        user: users[2]?._id || users[0]._id,
        subject: 'Refund request for cancelled booking',
        description: 'I had to cancel my booking due to unexpected rain. According to your cancellation policy, I should be eligible for a full refund as I cancelled 48 hours in advance. Please process my refund.',
        category: 'billing',
        priority: 'low',
        status: 'resolved',
        assignedTo: admins[1]?._id || admins[0]?._id,
        rating: 5,
        responses: [
          {
            from: 'support',
            message: 'Thank you for reaching out. Your cancellation is within our policy guidelines. We will process the refund within 3-5 business days.',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
          },
          {
            from: 'user',
            message: 'Thank you! When can I expect to see the refund in my account?',
            timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000) // 20 hours ago
          },
          {
            from: 'support',
            message: 'The refund has been initiated and should reflect in your account within 3-5 business days depending on your bank.',
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000) // 18 hours ago
          }
        ],
        resolvedAt: new Date(Date.now() - 18 * 60 * 60 * 1000)
      },
      {
        user: users[3]?._id || users[0]._id,
        subject: 'Cannot reset my account password',
        description: 'I forgot my password and the reset link sent to my email is not working. Every time I click it, it says the link has expired even though I just received it.',
        category: 'account',
        priority: 'medium',
        status: 'open',
        responses: []
      },
      {
        user: users[4]?._id || users[0]._id,
        subject: 'Questions about turf amenities',
        description: 'I would like to know if the turf provides parking facilities, changing rooms, and first aid kits. This information is not clearly mentioned on the turf details page.',
        category: 'general',
        priority: 'low',
        status: 'resolved',
        assignedTo: admins[2]?._id || admins[0]?._id,
        rating: 4,
        responses: [
          {
            from: 'support',
            message: 'Thank you for your query! The turf you are looking at includes free parking for up to 20 vehicles, separate changing rooms for men and women, and a basic first aid kit. We have updated the turf details page to include this information.',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
          }
        ],
        resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        user: users[0]._id,
        subject: 'Booking confirmation email not received',
        description: 'I completed my booking 2 hours ago and made the payment successfully, but I have not received any confirmation email yet. My booking ID is BK12345.',
        category: 'technical',
        priority: 'urgent',
        status: 'in-progress',
        assignedTo: admins[0]?._id,
        responses: [
          {
            from: 'support',
            message: 'We are checking the email delivery logs for your booking. Please check your spam folder in the meantime.',
            timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
          }
        ]
      }
    ];

    // Insert tickets with different creation dates
    for (let i = 0; i < sampleTickets.length; i++) {
      const ticket = sampleTickets[i];
      const createdDate = new Date(Date.now() - (sampleTickets.length - i) * 24 * 60 * 60 * 1000);
      
      await SupportTicket.create({
        ...ticket,
        createdAt: createdDate,
        updatedAt: ticket.responses.length > 0 
          ? ticket.responses[ticket.responses.length - 1].timestamp 
          : createdDate
      });
    }

    console.log('✅ Successfully seeded support tickets!');
    console.log(`   Created ${sampleTickets.length} sample support tickets`);
    
  } catch (error) {
    console.error('❌ Error seeding support tickets:', error.message);
  }
};

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../config/db.js').then(async ({ default: connectDB }) => {
    await connectDB();
    await seedSupportTickets();
    process.exit(0);
  });
}
