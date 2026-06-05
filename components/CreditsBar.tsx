import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown, Sparkles } from 'lucide-react';

interface CreditsBarProps {
    credits: number;
    maxCredits: number;
    isPremium: boolean;
    onUpgrade?: () => void;
}

const CreditsBar: React.FC<CreditsBarProps> = ({ isPremium }) => {
    const percentage = 100;

    const getBarColor = () => 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500';

    return (
        <div className="w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm bg-pink-50 text-pink-600">
                        <Crown size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                            Usage Status
                        </p>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                            Free Premium Access
                        </h4>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                            Unlimited
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Credits Remaining</p>
                </div>
            </div>

            {/* Progress Track */}
            <div className="relative h-2 w-full bg-gray-100 dark:bg-white/5 dark:bg-white dark:bg-[#12121a]/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`absolute inset-y-0 left-0 rounded-full ${getBarColor()} transition-colors duration-500`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </motion.div>
            </div>
        </div>
    );
};

export default CreditsBar;
