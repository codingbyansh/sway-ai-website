import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';

const LOADING_PHRASES = [
  'Perfecting your sync...',
  'Igniting chemistry nodes...',
  'Calibrating Sync AI frequencies...',
  'Brewing high-rizz replies...',
  'Analyzing dating algorithms...'
];

const LoadingScreen: React.FC = () => {
  const [statusText, setStatusText] = useState(LOADING_PHRASES[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_PHRASES.length;
      setStatusText(LOADING_PHRASES[index]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#06060c] select-none overflow-hidden">
      {/* Aesthetic Ambient Glowing Orb */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.45, 0.3],
          x: [-20, 20, -20],
          y: [-10, 10, -10],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-72 h-72 md:w-96 md:h-96 bg-gradient-to-tr from-pink-500/20 to-rose-600/10 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="flex flex-col items-center max-w-sm w-full px-6 text-center space-y-8 z-10">
        
        {/* Sleek Orbit Logo Container */}
        <div className="relative flex items-center justify-center">
          
          {/* Continuous Rotating Thin Orbit Line */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-44 h-44 md:w-52 md:h-52 rounded-full border border-dashed border-pink-500/30"
          />

          {/* Glowing breathing outer aura */}
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-36 h-36 md:w-44 md:h-44 rounded-full bg-pink-500/10 blur-2xl"
          />

          {/* Premium Glassmorphic Core */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-white/[0.02] dark:bg-white/[0.01] backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl p-4 md:p-5 overflow-hidden"
          >
            <Logo className="w-full h-full transform hover:scale-105 transition-transform" />
          </motion.div>
        </div>

        {/* Minimalist Branding Text */}
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center justify-center space-x-1.5"
          >
            <span>SYNC</span>
            <span className="bg-gradient-to-r from-pink-400 via-rose-500 to-red-500 bg-clip-text text-transparent">AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-[9px] font-black uppercase tracking-[0.6em] text-gray-400"
          >
            dating sync assistant
          </motion.p>
        </div>

        {/* Sleek 1px Micro Loading Line */}
        <div className="w-40 md:w-48 h-[1px] bg-white/5 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-1/2 h-full bg-gradient-to-r from-transparent via-pink-500 to-transparent"
          />
        </div>

        {/* Subtle Ambient Status Text */}
        <motion.div
          key={statusText}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.5, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="h-4 flex items-center justify-center"
        >
          <p className="text-[10px] font-bold text-gray-400 tracking-[0.15em] uppercase">
            {statusText}
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default LoadingScreen;
