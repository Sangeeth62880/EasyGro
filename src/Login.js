import React, { useState } from "react";
import { motion } from "framer-motion";
import { LockClosedIcon } from "@heroicons/react/solid";
import { FaGoogle, FaGithub } from "react-icons/fa";
import "./index.css"; // Import the CSS file

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <motion.div 
      className="login-container"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="login-title">Login</h2>
      <input 
        type="email" 
        className="input-field" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
      />
      <input 
        type="password" 
        className="input-field" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
      />
      <motion.button 
        className="login-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <LockClosedIcon className="h-5 w-5 mr-2" /> Login
      </motion.button>

      <div className="social-buttons">
        <motion.button 
          className="social-button google-btn"
          whileHover={{ scale: 1.05 }}
        >
          <FaGoogle size={20} /> Google
        </motion.button>
        <motion.button 
          className="social-button github-btn"
          whileHover={{ scale: 1.05 }}
        >
          <FaGithub size={20} /> GitHub
        </motion.button>
      </div>

      <div className="login-links mt-4">
      <p>
  <a href="/" onClick={(e) => e.preventDefault()} className="text-blue-500 hover:underline">
    Forgot password?
  </a>
</p>
<p>
  Don't have an account?  
  <a href="/" onClick={(e) => e.preventDefault()} className="text-blue-500 hover:underline">
    Sign up
  </a>
</p>

      </div>
    </motion.div>
  );
}

export default Login;
