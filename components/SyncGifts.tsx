import React from 'react';
import { motion } from 'framer-motion';
import { X, Gift, Sparkles, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface SyncGiftsProps {
    onClose: () => void;
    user: User;
    onUpdateUser: (user: User) => void;
}

const SyncGifts: React.FC<SyncGiftsProps> = ({ onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#FDFDFC] dark:bg-[#0a0a0f] overflow-y-auto transition-colors duration-300 flex flex-col"
            style={{ fontFamily: "'Outfit', sans-serif" }}
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FAE7E7] dark:bg-[#DE4557] rounded-full blur-[100px] opacity-40 dark:opacity-5 -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#F9CACE] dark:bg-[#A52038] rounded-full blur-[100px] opacity-30 dark:opacity-[0.03] -z-10 -translate-x-1/2 translate-y-1/2" />

            {/* ── Header ── */}
            <header className="px-6 py-5 border-b border-[#FAE7E7] dark:border-white/5 bg-white dark:bg-[#0a0a0f] backdrop-blur-xl flex items-center justify-between sticky top-0 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#A52038] to-[#DE4557] rounded-xl flex items-center justify-center shadow-lg shadow-[#A52038]/20 animate-pulse">
                        <Gift className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[#A52038] dark:text-rose-500 leading-tight">Sync Gifts</h2>
                        <p className="text-[10px] font-bold text-[#D58D95] dark:text-pink-400 tracking-[0.15em] uppercase">AI Gift Recommendation Engine</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2.5 bg-[#FAE7E7] dark:bg-white/5 hover:bg-[#F9CACE] dark:hover:bg-white/10 rounded-full transition-all text-[#A52038] dark:text-rose-400"
                >
                    <X size={20} />
                </button>
            </header>

            {/* ── Coming Soon Centered Section ── */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center max-w-2xl mx-auto w-full">
                
                {/* 3D-like floating gift graphic */}
                <motion.div
                    animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative w-32 h-32 md:w-40 md:h-40 mb-8"
                >
                    <div className="absolute inset-0 bg-[#A52038] dark:bg-rose-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                        <defs>
                            <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#DE4557" />
                                <stop offset="100%" stopColor="#A52038" />
                            </linearGradient>
                            <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF6B7D" />
                                <stop offset="100%" stopColor="#DE4557" />
                            </linearGradient>
                            <linearGradient id="ribGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFD814" />
                                <stop offset="100%" stopColor="#FF9900" />
                            </linearGradient>
                        </defs>
                        {/* Box body */}
                        <rect x="50" y="85" width="100" height="75" rx="12" fill="url(#boxGrad)" />
                        {/* Vertical ribbon */}
                        <rect x="90" y="85" width="20" height="75" fill="url(#ribGrad)" />
                        {/* Box lid */}
                        <rect x="42" y="70" width="116" height="20" rx="6" fill="url(#lidGrad)" />
                        {/* Horizontal ribbon on lid */}
                        <rect x="90" y="70" width="20" height="20" fill="url(#ribGrad)" />
                        {/* Ribbon bow loop left */}
                        <path d="M 100 70 C 80 50, 70 65, 100 70 Z" fill="url(#ribGrad)" stroke="#E47911" strokeWidth="1" />
                        {/* Ribbon bow loop right */}
                        <path d="M 100 70 C 120 50, 130 65, 100 70 Z" fill="url(#ribGrad)" stroke="#E47911" strokeWidth="1" />
                    </svg>
                    {/* Pulsing Sparkles */}
                    <div className="absolute top-2 right-2 text-yellow-400 animate-pulse">
                        <Sparkles size={24} />
                    </div>
                    <div className="absolute bottom-4 left-2 text-rose-400 animate-bounce delay-150">
                        <Sparkles size={16} />
                    </div>
                </motion.div>

                {/* Gifting Banner details */}
                <div className="bg-[#FAE7E7]/50 dark:bg-white/5 border border-[#FAE7E7] dark:border-white/5 p-6 md:p-8 rounded-[2rem] shadow-xl w-full relative overflow-hidden backdrop-blur-sm">
                    <span className="bg-gradient-to-r from-[#A52038] to-[#DE4557] text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider inline-block mb-4 shadow-sm animate-pulse">
                        Coming Soon
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-[#A52038] dark:text-rose-500 leading-tight mb-3">
                        AI Gift Recommendation Engine
                    </h3>
                    <p className="text-xs md:text-sm text-[#D58D95] dark:text-gray-300 font-semibold leading-relaxed mb-6">
                        We're building the ultimate Sync Gift recommendation assistant. Get hand-curated, perfect gift suggestions tailored to their exact personality, relationship stage, and occasion. 
                    </p>

                    {/* How it works previews */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left border-t border-[#FAE7E7] dark:border-white/5 pt-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#A52038]/10 text-[#A52038] dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-black flex items-center justify-center">1</span>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Describe Them</h4>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Input personality traits, budget, occasion, and relationship duration.</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#A52038]/10 text-[#A52038] dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-black flex items-center justify-center">2</span>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">AI Analysis</h4>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Sync AI matches traits with highly-engaging gift ideas with matching Sync score.</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#A52038]/10 text-[#A52038] dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-black flex items-center justify-center">3</span>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Send with Style</h4>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Get direct links to buy alongside custom written messages to melt their heart.</p>
                        </div>
                    </div>
                </div>

                {/* Back button */}
                <button
                    onClick={onClose}
                    className="mt-8 flex items-center gap-2 text-xs font-bold text-[#A52038] dark:text-rose-400 hover:text-[#DE4557] dark:hover:text-rose-300 transition-colors uppercase tracking-widest border-b border-[#FAE7E7] dark:border-white/10 pb-0.5"
                >
                    Go Back to replies <ArrowRight size={14} />
                </button>
            </main>
        </motion.div>
    );
};

export default SyncGifts;
