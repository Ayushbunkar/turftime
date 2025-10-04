import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button.jsx";
import footballImg from "../../assets/football.png";

const Hero = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (!isMoving) {
      controls.start({
        y: [0, -15, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      });
    } else {
      controls.stop();
    }
  }, [isMoving, controls]);

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden overflow-x-hidden">
      {/* Background */}
      <div className="absolute -top-1 inset-0 z-0 w-full h-full">
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1936&q=80"
            alt="Football turf"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-green-400 opacity-70"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                scale: Math.random() * 0.4 + 0.4,
              }}
              animate={{
                y: ["0%", "-100%"],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content wrapper */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 z-10 pt-20 pb-10 flex flex-col items-center lg:items-start justify-center h-full">
        {/* Text Block */}
        <div className="max-w-4xl text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight">
              Book Your Perfect{" "}
              <motion.span
                className="text-green-500 inline-block"
                animate={{ rotateX: [0, 15, 0], scale: [1, 1.05, 1] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                Turf Experience
              </motion.span>
            </h1>
          </motion.div>

          <motion.p
            className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-200 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Experience the thrill of playing on premium turfs. Easy booking,
            great facilities, and unforgettable moments await you.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/turfs">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Turfs <ArrowRight size={20} className="ml-2" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/about">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-white text-black w-full sm:w-auto"
                  variant="outline"
                  size="lg"
                >
                  Learn More
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Football ball (responsive) */}
        <motion.div
          className="absolute right-3 bottom-4 
          w-12 h-12 
          sm:w-16 sm:h-16 
          md:w-20 md:h-20 
          lg:w-24 lg:h-24 
          xl:w-28 xl:h-28 
          2xl:w-32 2xl:h-32"
          style={{ x, y }}
          animate={controls}
        >
          <img
            src={footballImg}
            alt="Football"
            className="w-full h-full object-contain rounded-full border border-white shadow-xl"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
