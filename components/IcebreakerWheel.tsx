import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, RotateCcw, Compass, Sparkles, Flame, HelpCircle, ShieldAlert, Volume2, VolumeX } from 'lucide-react';
import { fetchIcebreakers } from '../services/geminiService';

interface IcebreakerCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
}

const CATEGORIES: IcebreakerCategory[] = [
  { id: 'Gen Z Hinglish', name: 'Gen Z Hinglish', emoji: '🕺', color: '#f59e0b', gradient: 'from-amber-400 to-orange-500', description: 'Trendy, casual, and highly colloquial Hinglish starters.' },
  { id: 'Spicy Flirty', name: 'Spicy Flirty', emoji: '🔥', color: '#ec4899', gradient: 'from-pink-500 to-rose-600', description: 'Bold, charming, and playfully magnetic icebreakers.' },
  { id: 'Deep & Weird', name: 'Deep & Weird', emoji: '👾', color: '#14b8a6', gradient: 'from-teal-400 to-cyan-600', description: 'Existential, quirky questions to immediately bypass small talk.' },
  { id: 'Awkward Recovery', name: 'Awkward Recovery', emoji: '🩹', color: '#8b5cf6', gradient: 'from-violet-500 to-indigo-600', description: 'Self-aware, humorous revivers for dry or paused chats.' },
];

const IcebreakerWheel: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<IcebreakerCategory | null>(null);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play audio tick effects using basic synthesized Web Audio API (so we don't rely on static assets)
  const playTickSound = (frequency: number = 800, duration: number = 0.05) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext blocked or unsupported
    }
  };

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedCategory(null);
    setIcebreakers([]);

    // Determine random spins (5 to 7 full spins)
    const extraSpins = 5 + Math.floor(Math.random() * 3); 
    const randomSegment = Math.floor(Math.random() * CATEGORIES.length);
    const segmentAngle = 360 / CATEGORIES.length;
    
    // We want the pointer at top center (12 o'clock, which is 270 degrees in SVG coordinate space).
    // The center of segment index `randomSegment` is at SVG angle `(randomSegment * segmentAngle) + segmentAngle / 2`.
    // To land this segment center at 270 degrees, we need:
    // rotation + centerAngle = 270 (modulo 360).
    // So base target angle is: 270 - centerAngle.
    const baseAngle = (270 - (randomSegment * segmentAngle + segmentAngle / 2) + 360) % 360;
    
    // Calculate the clockwise rotation delta from current rotation position
    const currentAngle = rotation % 360;
    let delta = baseAngle - currentAngle;
    if (delta <= 0) {
      delta += 360;
    }
    
    const targetAngle = rotation + (extraSpins * 360) + delta;
    setRotation(targetAngle);

    // Audio clicks during spin
    const totalTicks = 35;
    for (let i = 0; i < totalTicks; i++) {
      const delay = Math.pow(i / totalTicks, 2) * 3500; // decelerating intervals
      setTimeout(() => {
        if (i === totalTicks - 1) {
          playTickSound(1000, 0.15); // Landing chime
        } else {
          playTickSound(600 + Math.random() * 200, 0.03);
        }
      }, delay);
    }

    setTimeout(async () => {
      setIsSpinning(false);
      const category = CATEGORIES[randomSegment];
      setSelectedCategory(category);
      await loadIcebreakers(category.id);
    }, 3800);
  };

  const loadIcebreakers = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchIcebreakers(categoryId);
      setIcebreakers(data);
    } catch (e) {
      setIcebreakers([
        "Are you a tea person or coffee person? Quick filter check!",
        "What's your most controversial food opinion?",
        "Tell me a secret and I'll tell you yours."
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    playTickSound(1200, 0.1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReset = () => {
    setRotation(0);
    setSelectedCategory(null);
    setIcebreakers([]);
  };

  return (
    <div className="px-3 md:px-6 pt-4 max-w-4xl mx-auto space-y-8">
      {/* Feature Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
          Infinite <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">Icebreaker Wheel</span>
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
          Need the perfect first text? Spin the wheel of charm, unlock custom high-engagement conversation starters, and match their vibe instantly.
        </p>
      </div>

      {/* Wheel Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Spinning Wheel visual */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative py-4 bg-white dark:bg-[#12121a] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm [perspective:1000px]">
          
          {/* Sounds toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 rounded-xl transition-all z-20"
            title={soundEnabled ? "Mute sound" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* 3D Wheel Base Container */}
          <div 
            className="relative mt-6 flex flex-col items-center [transform-style:preserve-3d] transition-transform duration-500 hover:scale-105"
            style={{ transform: 'rotateX(15deg)', perspective: '1000px' }}
          >
            
            {/* 3D Drop Shadow underneath the wheel */}
            <div 
              className="absolute inset-0 rounded-full bg-black/50 dark:bg-black/70 blur-lg" 
              style={{ transform: 'translateZ(-40px) translateY(16px) scale(0.95)' }}
            />

            {/* 3D Side/Edge representing thickness of cylinder */}
            <div 
              className="absolute inset-[-6px] rounded-full bg-gradient-to-b from-gray-700 to-gray-900 dark:from-[#2e2e3e] dark:to-[#0f0f15] border border-white/10 shadow-2xl" 
              style={{ transform: 'translateZ(-15px)' }}
            />

            {/* Pointer Arrow */}
            <div 
              className="absolute -top-4 z-20 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] flex flex-col items-center"
              style={{ transform: 'translateZ(10px) translateY(-50%)' }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M12 21L3 8H21L12 21Z" fill="#f43f5e" />
                <path d="M12 18L5 9H19L12 18Z" fill="#ec4899" />
              </svg>
              <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-[10px] left-[17px] animate-ping" />
            </div>

            {/* Wheel Frame */}
            <div 
              className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[8px] border-double border-white/20 dark:border-[#1e1e2d] shadow-[inset_0_4px_16px_rgba(255,255,255,0.15),0_12px_24px_rgba(0,0,0,0.5)] relative flex items-center justify-center overflow-hidden bg-[#0c0c14] [transform-style:preserve-3d]"
              style={{ transform: 'translateZ(0px)' }}
            >
              
              {/* Glossy Reflection Overlay (static, does not rotate) */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none z-10 rounded-full" />
              
              <motion.div
                animate={{ rotate: rotation }}
                transition={
                  isSpinning
                    ? { ease: [0.15, 0.85, 0.25, 1], duration: 3.8 }
                    : { type: 'spring', stiffness: 50 }
                }
                className="w-full h-full relative"
              >
                <svg width="100%" height="100%" viewBox="0 0 200 200" className="transform rotate-0">
                  <defs>
                    <radialGradient id="centerHub" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="60%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#881337" />
                    </radialGradient>
                    <radialGradient id="metallicBezel" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#4b5563" />
                      <stop offset="85%" stopColor="#111827" />
                      <stop offset="100%" stopColor="#030712" />
                    </radialGradient>
                  </defs>
                  
                  {CATEGORIES.map((cat, idx) => {
                    const angle = 360 / CATEGORIES.length;
                    const startAngle = idx * angle;
                    const endAngle = (idx + 1) * angle;

                    // Convert polar coordinates to Cartesian for the pie slices
                    const rad = Math.PI / 180;
                    const x1 = 100 + 100 * Math.cos(startAngle * rad);
                    const y1 = 100 + 100 * Math.sin(startAngle * rad);
                    const x2 = 100 + 100 * Math.cos(endAngle * rad);
                    const y2 = 100 + 100 * Math.sin(endAngle * rad);

                    // Calculate text labels placement
                    const textAngle = startAngle + angle / 2;
                    const textX = 100 + 58 * Math.cos(textAngle * rad);
                    const textY = 100 + 58 * Math.sin(textAngle * rad);

                    return (
                      <g key={cat.id} className="cursor-pointer select-none">
                        {/* Slices */}
                        <path
                          d={`M100,100 L${x1},${y1} A100,100 0 0,1 ${x2},${y2} Z`}
                          fill={cat.color}
                          opacity={isSpinning ? 0.95 : selectedCategory?.id === cat.id ? 1 : 0.8}
                          className="transition-opacity duration-300"
                          stroke="#0c0c14"
                          strokeWidth="2.5"
                        />
                        {/* Labels */}
                        <text
                          x={textX}
                          y={textY}
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="900"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                          letterSpacing="0.5"
                          style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)' }}
                        >
                          {cat.emoji} {cat.name.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                  {/* Center Hub (3D Metallic Design) */}
                  <circle cx="100" cy="100" r="18" fill="url(#metallicBezel)" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="100" cy="100" r="10" fill="url(#centerHub)" />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Action Spin Button */}
          <button
            disabled={isSpinning}
            onClick={spinWheel}
            className={`mt-8 px-10 py-3.5 rounded-full font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center space-x-2 transition-all duration-300 ${
              isSpinning
                ? 'bg-gray-300 dark:bg-white/10 text-gray-500 cursor-not-allowed scale-95 shadow-none'
                : 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white hover:scale-105 hover:shadow-pink-500/20'
            }`}
          >
            <Sparkles size={16} className={isSpinning ? 'animate-pulse' : 'animate-spin-slow'} />
            <span>{isSpinning ? 'Spinning...' : 'Spin the Wheel'}</span>
          </button>
        </div>

        {/* Right Side: Icebreaker Deck & Results */}
        <div className="lg:col-span-6 min-h-[360px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!selectedCategory && !isSpinning && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="text-center py-12 px-6 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-3xl space-y-3"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Compass size={32} className="animate-pulse" />
                </div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200">Ready to break the ice?</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  Click the spin button to select a random category and receive 3 bespoke conversation starters!
                </p>
              </motion.div>
            )}

            {isSpinning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 space-y-4 text-center"
              >
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="font-extrabold text-sm text-gray-800 dark:text-gray-100 uppercase tracking-widest animate-pulse">Calculating Vibe...</p>
                  <p className="text-xs text-gray-400 mt-1 italic">Matching alignments & chemistry nodes</p>
                </div>
              </motion.div>
            )}

            {selectedCategory && !isSpinning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                {/* Result Tag Banner */}
                <div className={`p-4 bg-gradient-to-r ${selectedCategory.gradient} text-white rounded-3xl shadow-lg relative overflow-hidden flex items-center justify-between`}>
                  <div className="absolute -right-6 -bottom-6 opacity-15">
                    <Compass size={110} strokeWidth={4} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-0.5">Landing Category</div>
                    <h3 className="text-lg md:text-xl font-black flex items-center space-x-2">
                      <span>{selectedCategory.emoji}</span>
                      <span>{selectedCategory.name}</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => loadIcebreakers(selectedCategory.id)}
                    disabled={isLoading}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-2xl transition-all duration-200 disabled:opacity-55 disabled:cursor-not-allowed"
                    title="Reload icebreakers"
                  >
                    <RotateCcw size={16} className={isLoading ? "animate-spin" : ""} />
                  </button>
                </div>

                {/* Icebreaker Cards Deck */}
                <div className="space-y-3">
                  {isLoading ? (
                    // Beautiful Loading Skeleton
                    [1, 2, 3].map((n) => (
                      <div key={n} className="bg-white dark:bg-[#12121a] p-4 rounded-2xl border border-gray-100 dark:border-white/5 animate-pulse space-y-2 h-[84px] flex flex-col justify-center">
                        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full w-4/5" />
                        <div className="h-3 bg-gray-200 dark:bg-white/5 rounded-full w-2/3" />
                      </div>
                    ))
                  ) : (
                    icebreakers.map((icebreaker, idx) => {
                      const isCopied = copiedIndex === idx;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white dark:bg-[#12121a] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between gap-4 group transition-all"
                        >
                          <div className="flex-1">
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold mb-1">Icebreaker #{idx + 1}</p>
                            <p className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 leading-relaxed">
                              {icebreaker}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => copyToClipboard(icebreaker, idx)}
                            className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                              isCopied
                                ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
                                : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/5 hover:border-pink-500/30 text-gray-400 group-hover:text-pink-500'
                            }`}
                            title="Copy to clipboard"
                          >
                            <AnimatePresence mode="wait">
                              {isCopied ? (
                                <motion.div
                                  key="check"
                                  initial={{ scale: 0.5, rotate: 45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0.5 }}
                                >
                                  <Check size={16} />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="copy"
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0.8 }}
                                >
                                  <Copy size={16} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Regenerate Trigger */}
                {!isLoading && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => loadIcebreakers(selectedCategory.id)}
                      className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-pink-600 transition-colors inline-flex items-center space-x-1"
                    >
                      <RotateCcw size={12} />
                      <span>Request a fresh batch</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default IcebreakerWheel;
