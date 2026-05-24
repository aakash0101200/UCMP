import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage({ embedded = false }) {
  const navigate = useNavigate();

  const containerClasses = embedded
    ? "flex flex-col items-center justify-center min-h-[65vh] bg-[#f5f5f5] dark:bg-zinc-900 text-foreground transition-colors duration-300 p-8 rounded-3xl border border-border/40 text-center max-w-4xl mx-auto"
    : "flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-[#f5f5f5] dark:bg-zinc-950 text-foreground transition-colors duration-300 px-4 py-12 text-center w-full";

  return (
    <div className={containerClasses}>
      <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
        
        {/* Animated 404 + Ghost SVG */}
        <div className="flex justify-center select-none">
          <svg viewBox="0 0 400 200" className="w-80 h-44 overflow-visible">
            {/* Red "4" Left */}
            <text 
              x="120" 
              y="145" 
              fill="#dc2626" 
              fontSize="135" 
              fontWeight="900" 
              fontFamily="system-ui, -apple-system, sans-serif" 
              textAnchor="middle"
            >
              4
            </text>
            
            {/* Red "0" (ellipse ring) */}
            <ellipse 
              cx="200" 
              cy="100" 
              rx="38" 
              ry="48" 
              fill="none" 
              stroke="#dc2626" 
              strokeWidth="24" 
            />
            
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
              {/* Ghost Body (Solid White) */}
              <path
                d="M 174,85 C 174,38 226,38 226,85 C 226,112 222,126 215,134 C 205,142 195,130 188,137 C 180,143 174,130 174,85 Z"
                fill="white"
              />
              {/* Waving Left Arm */}
              <path
                d="M 175,80 C 160,75 148,63 144,71 C 140,79 155,90 175,88 Z"
                fill="white"
              />
              {/* Resting Right Arm */}
              <path
                d="M 225,83 C 235,85 246,90 244,98 C 242,104 232,101 225,93 Z"
                fill="white"
              />
              {/* Eyes */}
              <ellipse cx="192" cy="66" rx="3" ry="5.5" fill="#0f172a" />
              <ellipse cx="208" cy="66" rx="3" ry="5.5" fill="#0f172a" />
              {/* Mouth */}
              <ellipse cx="200" cy="78" rx="3.5" ry="6" fill="#0f172a" />
            </motion.g>
            
            {/* Red "4" Right */}
            <text 
              x="280" 
              y="145" 
              fill="#dc2626" 
              fontSize="135" 
              fontWeight="900" 
              fontFamily="system-ui, -apple-system, sans-serif" 
              textAnchor="middle"
            >
              4
            </text>
          </svg>
        </div>

        {/* Text Section */}
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Page not found
          </h1>
          <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
            The Page you are looking for doesn't exist or an other error occured.{" "}
            <span
              onClick={() => navigate(-1)}
              className="text-neutral-800 dark:text-zinc-200 hover:underline font-semibold cursor-pointer"
            >
              Go back
            </span>
            , or head over to{" "}
            <Link to="/" className="text-[#dc2626] hover:underline font-semibold">
              Home
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
