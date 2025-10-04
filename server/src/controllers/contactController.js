import Contact from '../models/Contact.js';
import { sendEmail } from '../utils/sendEmail.js';

export const submitContactForm = async (req, res) => {
  const { fullname, email, feedback } = req.body;

  try {
    const newMessage = new Contact({ fullname, email, feedback });
    await newMessage.save();

    // Optional: Send notification to admin (you can customize the recipient)
    await sendEmail(
      'admin@yourdomain.com',
      'New Contact Message',
      `<h4>New Contact Message</h4>
       <p><strong>Name:</strong> ${fullname}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Feedback:</strong><br>${feedback}</p>`
    );

    res.status(201).json({ message: 'Message submitted successfully' });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to submit message',
      error: err.message,
    });
  }
};
