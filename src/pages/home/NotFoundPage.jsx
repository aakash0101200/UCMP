import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage({ embedded = false }) {
  const navigate = useNavigate();

  const containerClasses = embedded
    ? "flex flex-col items-center justify-center min-h-[65vh] bg-[#f8f9fa] dark:bg-background text-foreground transition-colors duration-300 p-8 rounded-3xl border border-border/40 text-center max-w-4xl mx-auto"
    : "flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-[#f8f9fa] dark:bg-background text-foreground transition-colors duration-300 px-4 py-12 text-center";

  return (
    <div className={containerClasses}>
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Animated 404 + Ghost SVG */}
        <div className="flex justify-center">
          <svg viewBox="0 0 400 200" className="w-80 h-44 select-none overflow-visible">
            {/* Red "4" Left */}
            <text x="30" y="150" fill="#e11d48" fontSize="140" fontWeight="bold" fontFamily="system-ui, sans-serif">4</text>
            
            {/* Zero (ellipse ring) */}
            <ellipse cx="200" cy="105" rx="42" ry="52" fill="none" stroke="#e11d48" strokeWidth="26" />
            
            {/* Animated Ghost peeking out */}
            <motion.g
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4, 
                ease: "easeInOut" 
              }}
            >
              {/* Ghost Body */}
              <path
                d="M172,100 C172,62 185,46 200,46 C215,46 228,62 228,100 C228,124 218,128 200,128 C182,128 172,124 172,100 Z"
                fill="white"
                stroke="#e11d48"
                strokeWidth="4"
              />
              {/* Peeking arms/waviness */}
              <path
                d="M168,90 C162,90 156,96 156,102 C156,108 162,110 168,106 Z"
                fill="white"
                stroke="#e11d48"
                strokeWidth="3"
              />
              <path
                d="M232,90 C238,90 244,96 244,102 C244,108 238,110 232,106 Z"
                fill="white"
                stroke="#e11d48"
                strokeWidth="3"
              />
              {/* Eyes */}
              <ellipse cx="193" cy="80" rx="3.5" ry="6" fill="#0f172a" />
              <ellipse cx="207" cy="80" rx="3.5" ry="6" fill="#0f172a" />
              {/* Mouth */}
              <ellipse cx="200" cy="94" rx="4" ry="6.5" fill="#0f172a" />
            </motion.g>
            
            {/* Red "4" Right */}
            <text x="275" y="150" fill="#e11d48" fontSize="140" fontWeight="bold" fontFamily="system-ui, sans-serif">4</text>
          </svg>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-foreground tracking-tight">
            Page not found
          </h1>
          <p className="text-sm text-neutral-500 dark:text-muted-foreground leading-relaxed max-w-sm mx-auto">
            The Page you are looking for doesn't exist or an other error occured.{" "}
            <span
              onClick={() => navigate(-1)}
              className="text-[#e11d48] hover:underline font-medium cursor-pointer"
            >
              Go back
            </span>
            , or head over to{" "}
            <Link to="/" className="text-[#e11d48] hover:underline font-medium">
              Home
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
