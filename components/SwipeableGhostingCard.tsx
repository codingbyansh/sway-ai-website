import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Check, X, Copy } from 'lucide-react';
import { GhostingReply } from '../types';

interface SwipeableGhostingCardProps {
    reply: GhostingReply;
    onAccept?: (reply: GhostingReply) => void;
    onReject?: (reply: GhostingReply) => void;
    onNext?: () => void;
}

const SwipeableGhostingCard: React.FC<SwipeableGhostingCardProps> = ({ reply, onAccept, onReject, onNext }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

    const controls = useAnimation();

    const handleDragEnd = async (event: any, info: any) => {
        if (info.offset.x > 100) {
            await controls.start({ x: 500, opacity: 0 });
            onAccept?.(reply);
            onNext?.();
        } else if (info.offset.x < -100) {
            await controls.start({ x: -500, opacity: 0 });
            onReject?.(reply);
            onNext?.();
        } else {
            controls.start({ x: 0, opacity: 1 });
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(reply.text);
        alert('Copied to clipboard!');
    };

    const getPercentageColor = (pct: number) => {
        if (pct >= 80) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950/40';
        if (pct >= 50) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950/40';
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950/40';
    };

    return (
        <div className="relative w-full" style={{ height: 230 }}>
            <motion.div
                drag="x"
                style={{ x, rotate, opacity, position: 'absolute', inset: 0 }}
                animate={controls}
                onDragEnd={handleDragEnd}
                className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-[#12121a] dark:via-[#2b1b1b] dark:to-[#12121a] rounded-2xl shadow-xl border border-orange-200/50 dark:border-white/10 p-4 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none"
            >
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-wider">{reply.strategy}</span>
                        <div className="flex space-x-2 items-center">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${getPercentageColor(reply.recoveryChance)}`}>
                                {reply.recoveryChance}% Chance
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); copyToClipboard(); }} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-colors bg-orange-100/50 dark:bg-white/5">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <p className="text-sm text-gray-800 dark:text-gray-100 font-medium leading-relaxed italic line-clamp-3">
                        "{reply.text}"
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 italic mt-1 line-clamp-1">{reply.explanation}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100/50 dark:border-white/5">
                    <div className="flex items-center text-[10px] text-gray-400">
                        <span className="flex items-center mr-3"><X size={10} className="mr-0.5 text-red-400" /> Reject</span>
                        <span className="flex items-center"><Check size={10} className="mr-0.5 text-green-400" /> Accept</span>
                    </div>
                    <div className="text-[9px] text-gray-300 font-medium uppercase tracking-widest">Swipe</div>
                </div>

                {/* Visual Swiping Indicators */}
                <motion.div
                    style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
                    className="absolute top-3 right-3 bg-green-500 text-white p-1.5 rounded-full shadow-lg"
                >
                    <Check size={18} />
                </motion.div>
                <motion.div
                    style={{ opacity: useTransform(x, [0, -100], [0, 1]) }}
                    className="absolute top-3 left-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg"
                >
                    <X size={18} />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default SwipeableGhostingCard;
