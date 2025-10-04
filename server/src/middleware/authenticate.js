// src/middleware/authenticate.js
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided or invalid format');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    req.user = decoded; // Attach decoded user info to the request
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
