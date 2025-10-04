import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-40 h-40 mx-auto mb-8">
            <div
              className="absolute inset-0 rounded-full border-8 border-green-500 bg-gradient-to-tr from-green-400 via-green-200 to-green-100 opacity-30 animate-pulse"
              style={{ animationDuration: '2.5s' }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-green-500">
                <span className="text-6xl font-bold text-green-600">404</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-green-700 mb-4 drop-shadow-lg">Page Not Found</h1>
          <p className="text-xl text-green-800 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button size="lg" className="bg-green-600 text-white font-bold px-6 py-2 rounded-lg shadow-md hover:bg-green-800 transition-all">
              <Home size={20} className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
