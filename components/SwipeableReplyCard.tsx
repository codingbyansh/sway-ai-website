import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Copy, Sparkles } from 'lucide-react';
import { ReplyOption } from '../types';

interface SwipeableReplyCardProps {
    reply: ReplyOption;
    onAccept?: (reply: ReplyOption) => void;
    onReject?: (reply: ReplyOption) => void;
    onNext?: () => void;
}

const SwipeableReplyCard: React.FC<SwipeableReplyCardProps> = ({ reply, onAccept, onReject, onNext }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(reply.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    // Shared bobbing animation for the floating robot and the hand-held cards
    const bobAnimation = {
        y: [0, -10, 0],
        transition: {
            repeat: Infinity,
            duration: 3.5,
            ease: "easeInOut"
        }
    };

    return (
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 p-6 bg-white dark:bg-[#12121a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl relative overflow-visible select-none min-h-[420px]">
            
            {/* Robot Illustration Column */}
            <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] shrink-0">
                <svg viewBox="0 0 500 500" className="w-full h-full">
                    <defs>
                        {/* Visor gradient */}
                        <radialGradient id="visGrad" cx="50%" cy="40%" r="50%">
                            <stop offset="0%" stopColor="#1e0b36" />
                            <stop offset="100%" stopColor="#080112" />
                        </radialGradient>
                        
                        {/* Body gradient */}
                        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ff758f" />
                            <stop offset="50%" stopColor="#e91e63" />
                            <stop offset="100%" stopColor="#880e4f" />
                        </linearGradient>

                        {/* Swoosh ribbon gradient */}
                        <linearGradient id="swooshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fff0f3" />
                            <stop offset="60%" stopColor="#ffccd5" />
                            <stop offset="100%" stopColor="#ffb3c1" />
                        </linearGradient>

                        {/* Headphone band gradient */}
                        <linearGradient id="headGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#d81b60" />
                            <stop offset="100%" stopColor="#4a0072" />
                        </linearGradient>

                        {/* Jet flame gradient */}
                        <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ff007f" />
                            <stop offset="40%" stopColor="#9c27b0" />
                            <stop offset="100%" stopColor="#e040fb" stopOpacity="0" />
                        </linearGradient>

                        {/* Sync Logo Swirl gradient */}
                        <linearGradient id="logoSwirlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ff9f3b" />
                            <stop offset="50%" stopColor="#f43f6e" />
                            <stop offset="100%" stopColor="#be123c" />
                        </linearGradient>

                        {/* Neon glowing filter */}
                        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Platform / Hover Base Plate (static at bottom, 3D perspective) */}
                    <g id="base-plate">
                        {/* Platform Shadow */}
                        <ellipse cx="250" cy="445" rx="140" ry="24" fill="#f43f6e" opacity="0.18" filter="url(#neonGlow)" />
                        
                        {/* Platform 3D Side Thickness (Lip) */}
                        <path d="M 120 440 L 135 460 C 135 468, 365 468, 365 460 L 380 440 C 370 445, 130 445, 120 440 Z" fill="#1b082e" stroke="#ff4fa8" strokeWidth="2.5" filter="url(#neonGlow)" />
                        
                        {/* Platform Top Surface */}
                        <ellipse cx="250" cy="440" rx="130" ry="20" fill="#0c0317" stroke="#ff4fa8" strokeWidth="2" />
                        <ellipse cx="250" cy="440" rx="122" ry="16" fill="#06010c" />
                        
                        {/* Label Insert on the front lip */}
                        <path d="M 195 452 L 305 452 C 312 452, 312 460, 305 460 L 195 460 C 188 460, 188 452, 195 452 Z" fill="#090117" stroke="#ff4fa8" strokeWidth="1" />
                        <text x="250" y="458" textAnchor="middle" fill="#ff758f" fontSize="8.5" fontWeight="900" letterSpacing="2.5" filter="url(#neonGlow)">SYNC AI</text>
                    </g>

                    {/* Hover beam connection */}
                    <line x1="250" y1="380" x2="250" y2="435" stroke="#ff4fa8" strokeWidth="2.5" opacity="0.25" strokeDasharray="5,5" filter="url(#neonGlow)" />

                    {/* Bobbing Robot Body Group */}
                    <motion.g id="robot" animate={bobAnimation}>
                        {/* Jet Engine Flame (Multiple layers for hot core) */}
                        <path d="M 235 375 Q 250 440 265 375 Q 250 395 235 375 Z" fill="url(#flameGrad)" filter="url(#neonGlow)">
                            <animate attributeName="d" 
                                     values="M 235 375 Q 250 440 265 375 Q 250 395 235 375 Z; 
                                             M 233 375 Q 250 452 267 375 Q 250 405 233 375 Z; 
                                             M 237 375 Q 250 430 263 375 Q 250 390 237 375 Z; 
                                             M 235 375 Q 250 440 265 375 Q 250 395 235 375 Z" 
                                     dur="0.6s" repeatCount="indefinite" />
                        </path>
                        <path d="M 242 375 Q 250 415 258 375 Q 250 388 242 375 Z" fill="#ff758f" opacity="0.8" filter="url(#neonGlow)">
                            <animate attributeName="d" 
                                     values="M 242 375 Q 250 415 258 375 Q 250 388 242 375 Z; 
                                             M 241 375 Q 250 422 259 375 Q 250 392 241 375 Z; 
                                             M 243 375 Q 250 408 257 375 Q 250 385 243 375 Z; 
                                             M 242 375 Q 250 415 258 375 Q 250 388 242 375 Z" 
                                     dur="0.6s" repeatCount="indefinite" />
                        </path>

                        {/* Jet thruster nozzle */}
                        <path d="M 233 365 L 267 365 L 260 380 L 240 380 Z" fill="#2d1347" stroke="#4a157d" strokeWidth="1" />

                        {/* Body Shell Back shadow */}
                        <path d="M 160 220 C 145 280, 180 370, 250 375 C 320 370, 355 280, 340 220 Z" fill="#880e4f" />

                        {/* Body Shell Front (Teardrop shape, glossy pink gradient) */}
                        <path d="M 170 230 C 160 280, 190 365, 250 370 C 310 365, 340 280, 330 230 C 320 160, 180 160, 170 230 Z" fill="url(#bodyGrad)" />

                        {/* 3D Drop Shadow for the Swoosh Ribbon */}
                        <path d="M 295 128 C 320 148, 335 193, 332 238 C 330 293, 275 333, 245 353 C 220 333, 240 298, 265 278 C 295 248, 308 218, 298 188 C 288 158, 260 148, 240 158 C 210 173, 198 208, 192 248 C 187 288, 212 328, 178 351 C 158 321, 155 261, 172 208 C 190 155, 230 115, 295 128 Z" fill="#4a0026" opacity="0.3" />

                        {/* Cream/beige curved decorative panel (S-ribbon) with 3D highlight bevel */}
                        <path d="M 295 125 C 320 145, 335 190, 332 235 C 330 290, 275 330, 245 350 C 220 330, 240 295, 265 275 C 295 245, 308 215, 298 185 C 288 155, 260 145, 240 155 C 210 170, 198 205, 192 245 C 187 285, 212 325, 178 348 C 158 318, 155 258, 172 205 C 190 152, 230 112, 295 125 Z" fill="url(#swooshGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

                        {/* Visor screen frames */}
                        <ellipse cx="250" cy="180" rx="72" ry="62" fill="#880e4f" />
                        <ellipse cx="250" cy="180" rx="68" ry="58" fill="#e91e63" />

                        {/* Dark Visor Glass */}
                        <ellipse cx="250" cy="180" rx="62" ry="52" fill="url(#visGrad)" stroke="#ff4fa8" strokeWidth="2.5" />

                        {/* Visor Glass Glare (Specular Highlight) */}
                        <path d="M 205 155 Q 250 135 295 155 Q 250 147 205 155 Z" fill="#ffffff" opacity="0.2" />

                        {/* Digital Face elements (LED grid style) */}
                        <g id="face">
                            {/* Glowing pink blushes */}
                            <ellipse cx="205" cy="195" rx="7" ry="5" fill="#e91e63" opacity="0.6" />
                            <ellipse cx="295" cy="195" rx="7" ry="5" fill="#e91e63" opacity="0.6" />
                            
                            {/* Digital winking/blinking pixelated eyes (glitch-free centered ellipses) */}
                            <ellipse id="visor-eye-l" cx="220" cy="175" rx="10" ry="10" fill="#ff758f" filter="url(#neonGlow)">
                                <animate attributeName="ry" 
                                         values="10;10;1;10;10;10;10" 
                                         dur="4.5s" repeatCount="indefinite" />
                            </ellipse>

                            <ellipse id="visor-eye-r" cx="280" cy="175" rx="10" ry="10" fill="#ff758f" filter="url(#neonGlow)">
                                <animate attributeName="ry" 
                                         values="10;10;1;10;10;10;10" 
                                         dur="4.5s" repeatCount="indefinite" />
                            </ellipse>

                            {/* Digital Smile */}
                            <path d="M 238 194 Q 250 204 262 194" stroke="#ff758f" strokeWidth="3.5" strokeLinecap="round" fill="none" filter="url(#neonGlow)" />
                        </g>

                        {/* Headphones Band (Glossy) */}
                        <path d="M 175 132 A 95 95 0 0 1 325 132" stroke="url(#headGrad)" strokeWidth="13" fill="none" strokeLinecap="round" />
                        <path d="M 175 132 A 95 95 0 0 1 325 132" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.3" />
                        
                        {/* Headphones Cups */}
                        <g id="headphones">
                            <g transform="translate(150, 140) rotate(-15)">
                                <rect x="-14" y="-8" width="28" height="66" rx="14" fill="#4a0072" stroke="#ff4fa8" strokeWidth="2" filter="url(#neonGlow)" />
                                <rect x="-14" y="-8" width="28" height="66" rx="14" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.25" />
                                <ellipse cx="0" cy="25" rx="7" ry="16" fill="none" stroke="#ff4fa8" strokeWidth="3" filter="url(#neonGlow)" />
                                <ellipse cx="0" cy="25" rx="4" ry="10" fill="#ff758f" />
                            </g>
                            <g transform="translate(350, 140) rotate(15)">
                                <rect x="-14" y="-8" width="28" height="66" rx="14" fill="#4a0072" stroke="#ff4fa8" strokeWidth="2" filter="url(#neonGlow)" />
                                <rect x="-14" y="-8" width="28" height="66" rx="14" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.25" />
                                <ellipse cx="0" cy="25" rx="7" ry="16" fill="none" stroke="#ff4fa8" strokeWidth="3" filter="url(#neonGlow)" />
                                <ellipse cx="0" cy="25" rx="4" ry="10" fill="#ff758f" />
                            </g>
                        </g>

                        {/* Glowing chest neon swooshes */}
                        <path d="M 185 275 Q 235 340 315 275" fill="none" stroke="#ff4fa8" strokeWidth="4" strokeLinecap="round" filter="url(#neonGlow)" />
                        <path d="M 195 295 Q 235 352 305 295" fill="none" stroke="#ff4fa8" strokeWidth="2.5" strokeLinecap="round" filter="url(#neonGlow)" />

                        {/* Robotic Arms & Joints */}
                        {/* Left arm */}
                        <g>
                            <circle cx="168" cy="255" r="8" fill="#2d0a47" />
                            <path d="M 168 255 L 125 275" stroke="#be123c" strokeWidth="8" strokeLinecap="round" />
                            <circle cx="125" cy="275" r="6" fill="#ff4fa8" filter="url(#neonGlow)" />
                            <path d="M 125 275 L 90 285" stroke="#e91e63" strokeWidth="7" strokeLinecap="round" />
                            <path d="M 87 280 C 80 280, 80 292, 87 292 L 95 292 C 98 292, 98 280, 95 280 Z" fill="#880e4f" />
                        </g>
                        {/* Right arm */}
                        <g>
                            <circle cx="332" cy="255" r="8" fill="#2d0a47" />
                            <path d="M 332 255 L 375 275" stroke="#be123c" strokeWidth="8" strokeLinecap="round" />
                            <circle cx="375" cy="275" r="6" fill="#ff4fa8" filter="url(#neonGlow)" />
                            <path d="M 375 275 L 410 285" stroke="#e91e63" strokeWidth="7" strokeLinecap="round" />
                            <path d="M 413 280 C 420 280, 420 292, 413 292 L 405 292 C 402 292, 402 280, 405 280 Z" fill="#880e4f" />
                        </g>

                        {/* Floating Glowing Sync AI Logo Swirl above left hand (Viewer's left) */}
                        <g id="sync-swirl-logo">
                            {/* Glow shadow */}
                            <path d="M -12 8 C -22 8, -22 -12, -12 -12 C -6 -12, -4 -6, 0 -4 C 4 -2, 8 -6, 12 -4 C 22 -4, 22 16, 12 16 C 6 16, 4 10, 0 8 C -4 6, -8 8, -12 8 Z" fill="#ff0055" opacity="0.18" filter="url(#neonGlow)" transform="translate(85, 245) scale(0.85)" />
                            {/* Main shape */}
                            <path d="M -8 4 C -16 4, -18 -8, -10 -8 C -6 -8, -4 -3, 0 -2 C 4 -1, 6 -5, 10 -4 C 18 -3, 16 10, 8 10 C 4 10, 2 5, 0 4 C -2 3, -4 4, -8 4 Z" fill="url(#logoSwirlGrad)" stroke="#ffffff" strokeWidth="0.8" transform="translate(85, 245) scale(0.85)" />
                            
                            <animateTransform 
                                attributeName="transform"
                                type="translate"
                                values="0 0; 0 -8; 0 0"
                                dur="2.5s"
                                repeatCount="indefinite"
                            />
                            <animateTransform 
                                attributeName="transform"
                                type="rotate"
                                values="-5; 5; -5"
                                dur="4.5s"
                                repeatCount="indefinite"
                                additive="sum"
                                transform-origin="85 245"
                            />
                        </g>
                    </motion.g>
                </svg>

                {/* Option Cards floating on hands (synchronized bobbing) */}
                {/* REJECT CARD (Left hand, viewer's left) */}
                <motion.div 
                    animate={bobAnimation}
                    drag
                    dragConstraints={{ left: -150, right: 100, top: -80, bottom: 80 }}
                    dragElastic={0.4}
                    onDragEnd={(e, info) => {
                        if (info.offset.x < -60 || info.offset.y > 60 || info.offset.y < -60) {
                            onReject?.(reply);
                            onNext?.();
                        }
                    }}
                    onTap={() => {
                        onReject?.(reply);
                        onNext?.();
                    }}
                    className="absolute left-[18%] top-[55%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                >
                    <div className="flex items-center space-x-1 bg-[#120524]/90 border border-red-500/50 hover:border-red-400 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-[0_0_12px_rgba(239,68,68,0.2)] hover:shadow-[0_0_18px_rgba(239,68,68,0.45)] hover:scale-105 active:scale-95 transition-all text-[10px] font-black text-red-400 uppercase tracking-widest">
                        <X size={12} className="text-red-400" />
                        <span>Reject</span>
                    </div>
                </motion.div>

                {/* ACCEPT CARD (Right hand, viewer's right) */}
                <motion.div 
                    animate={bobAnimation}
                    drag
                    dragConstraints={{ left: -100, right: 150, top: -80, bottom: 80 }}
                    dragElastic={0.4}
                    onDragEnd={(e, info) => {
                        if (info.offset.x > 60 || info.offset.y > 60 || info.offset.y < -60) {
                            onAccept?.(reply);
                            onNext?.();
                        }
                    }}
                    onTap={() => {
                        onAccept?.(reply);
                        onNext?.();
                    }}
                    className="absolute left-[82%] top-[55%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                >
                    <div className="flex items-center space-x-1 bg-[#120524]/90 border border-green-500/50 hover:border-green-400 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-[0_0_12px_rgba(34,197,94,0.2)] hover:shadow-[0_0_18px_rgba(34,197,94,0.45)] hover:scale-105 active:scale-95 transition-all text-[10px] font-black text-green-400 uppercase tracking-widest">
                        <Check size={12} className="text-green-400" />
                        <span>Accept</span>
                    </div>
                </motion.div>
            </div>

            {/* Speech Bubble Column (displays suggested reply) */}
            <div className="flex-1 min-w-[260px] max-w-md w-full relative">
                {/* Speech Bubble body */}
                <div className="bg-[#be123c] dark:bg-[#9f1239] text-white rounded-3xl p-5 md:p-6 shadow-2xl relative border border-pink-400/20 flex flex-col justify-between min-h-[160px] transition-all">
                    
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                        <div className="flex items-center space-x-1">
                            <Sparkles size={13} className="text-pink-200 animate-pulse" />
                            <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-90">
                                OPTIMIZED SUGGESTION
                            </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            reply.style === 'Safe' ? 'bg-blue-900/40 text-blue-200 border border-blue-400/20' :
                            reply.style === 'Balanced' ? 'bg-purple-900/40 text-purple-200 border border-purple-400/20' :
                            'bg-orange-950/40 text-orange-200 border border-orange-400/20'
                        }`}>
                            {reply.style} Style
                        </span>
                    </div>

                    {/* Reply Text */}
                    <p className="text-sm md:text-base font-semibold leading-relaxed italic text-pink-50 mb-4 select-text">
                        "{reply.text}"
                    </p>

                    {/* Clipboard copy helper button inside the speech bubble */}
                    <button
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}
                        className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 hover:scale-[1.01] active:scale-95 text-white py-2 rounded-xl text-xs font-bold transition-all border border-white/10 shadow-sm"
                    >
                        {copied ? (
                            <>
                                <Check size={14} className="text-green-300" />
                                <span className="text-green-100">Copied to Clipboard!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={14} className="text-pink-100" />
                                <span>Copy Reply text</span>
                            </>
                        )}
                    </button>

                    {/* Responsive bubble pointing arrow */}
                    {/* Points left on large screen, points down on small screen */}
                    <div className="absolute lg:left-0 lg:top-[40%] lg:-translate-x-full lg:translate-y-0 left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0 border-[10px] border-transparent lg:border-r-[#be123c] lg:dark:border-r-[#9f1239] border-t-[#be123c] dark:border-t-[#9f1239] pointer-events-none" />
                </div>

                {/* Swiping Tip */}
                <div className="text-center mt-6 lg:mt-3 text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
                    Tip: Click or Swipe the cards to decide!
                </div>
            </div>
        </div>
    );
};

export default SwipeableReplyCard;
