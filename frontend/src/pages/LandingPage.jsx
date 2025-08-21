// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center text-white px-6">
      
      {/* Heading Animation */}
      <motion.h1 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-5xl md:text-7xl font-extrabold text-center drop-shadow-lg"
      >
        Connect <span className="text-yellow-300">People</span>
      </motion.h1>

      {/* Sub Heading */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-6 text-lg md:text-2xl text-center max-w-2xl"
      >
        A modern way to chat, share, and stay connected.  
        Simple. Fast. Secure.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="mt-10 flex space-x-6"
      >
        <Link 
          to="/login" 
          className="bg-yellow-400 text-black px-6 py-3 rounded-2xl font-semibold hover:bg-yellow-300 transition"
        >
          Get Started
        </Link>
        <Link 
          to="/register" 
          className="border-2 border-white px-6 py-3 rounded-2xl font-semibold hover:bg-white hover:text-purple-600 transition"
        >
          Join Now
        </Link>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 text-sm opacity-80">
        © {new Date().getFullYear()} Connect People. All Rights Reserved.
      </div>
    </div>
  );
};

export default LandingPage;
