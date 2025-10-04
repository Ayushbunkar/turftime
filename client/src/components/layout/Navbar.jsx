import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // <-- Add this import

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { user } = useAuth(); // <-- Get user from AuthContext

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Add this useEffect to force re-render on user change (optional, for some setups)
  useEffect(() => {
    // This effect will run when user changes, causing a re-render
  }, [user]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Turfs", path: "/turfs" },
    { name: "Contact", path: "/contact" }
  ];

  const navTextColor = !isHome || scrolled ? "text-black" : "text-white";
  const logoColor = "text-green-600";

  // Reusable button styles
  const btnBase =
    "px-5 py-2 font-medium rounded-md transition duration-300";
  const btnOutline =
    `${btnBase} border border-green-600 text-green-600 hover:bg-green-600 hover:text-white`;
  const btnFilled =
    `${btnBase} bg-green-600 text-white hover:bg-green-700`;

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        !isHome || scrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`text-2xl font-bold tracking-wide ${logoColor}`}
            >
              TurfTime
            </motion.span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium transition hover:text-green-600 ${navTextColor}`}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center space-x-3">
              {user ? (
                // If logged in, show Dashboard button
                <Link to="/user-dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className={btnFilled}
                  >
                    Dashboard
                  </motion.button>
                </Link>
              ) : (
                // If not logged in, show Login and Sign Up
                <>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className={btnOutline}
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link to="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className={btnFilled}
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className={`p-2 rounded-md transition ${navTextColor}`}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-3 bg-white rounded-xl shadow-xl border border-gray-200"
            >
              <div className="flex flex-col px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="font-medium text-black hover:text-green-600 transition"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                  {user ? (
                    <Link to="/user-dashboard">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className={btnFilled + " w-full"}
                      >
                        Dashboard
                      </motion.button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/login">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className={btnOutline + " w-full"}
                        >
                          Login
                        </motion.button>
                      </Link>
                      <Link to="/signup">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className={btnFilled + " w-full"}
                        >
                          Sign Up
                        </motion.button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
