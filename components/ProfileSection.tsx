import React, { useState, useEffect } from 'react';
import { LogOut, Star, MessageCircle, Sparkles, Crown, Shield, ChevronRight, Flame, Trophy, Award, Lock, Share2, Instagram, Copy, Check } from 'lucide-react';
import { User as UserType } from '../types';
import CreditsBar from './CreditsBar';

interface ProfileSectionProps {
    user: UserType;
    onLogout: () => void;
    onOpenPremium: () => void;
    onOpenSaved: () => void;
}

interface Badge {
    id: string;
    name: string;
    description: string;
    emoji: string;
    color: string;
    unlocked: boolean;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onLogout, onOpenPremium, onOpenSaved }) => {
    const [syncStreak, setSyncStreak] = useState(0);
    const [daresCompleted, setDaresCompleted] = useState(0);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        // Retrieve gamified status
        const savedStreak = localStorage.getItem('sync_flare_streak');
        const savedCompleted = localStorage.getItem('sync_dares_completed_count');
        if (savedStreak) setSyncStreak(parseInt(savedStreak));
        if (savedCompleted) setDaresCompleted(parseInt(savedCompleted));
    }, []);

    // Calculate level based on completed dares
    let currentLevel = "Spark Syncer";
    let nextLevel = "Vibe Syncer";
    let levelIndex = 1;
    let targetDares = 1;
    let xpPercent = 0;

    if (daresCompleted >= 13) {
        currentLevel = "Master of Sync";
        nextLevel = "Ultimate Legend";
        levelIndex = 5;
        targetDares = 20;
        xpPercent = Math.min(100, Math.floor((daresCompleted / 20) * 100));
    } else if (daresCompleted >= 8) {
        currentLevel = "Sync Virtuoso";
        nextLevel = "Master of Sync";
        levelIndex = 4;
        targetDares = 13;
        const progress = daresCompleted - 8;
        xpPercent = Math.floor((progress / 5) * 100);
    } else if (daresCompleted >= 4) {
        currentLevel = "Charming Signal";
        nextLevel = "Sync Virtuoso";
        levelIndex = 3;
        targetDares = 8;
        const progress = daresCompleted - 4;
        xpPercent = Math.floor((progress / 4) * 100);
    } else if (daresCompleted >= 1) {
        currentLevel = "Vibe Syncer";
        nextLevel = "Charming Signal";
        levelIndex = 2;
        targetDares = 4;
        const progress = daresCompleted - 1;
        xpPercent = Math.floor((progress / 3) * 100);
    } else {
        currentLevel = "Spark Syncer";
        nextLevel = "Vibe Syncer";
        levelIndex = 1;
        targetDares = 1;
        xpPercent = 0;
    }

    // Configure Badge system
    const badges: Badge[] = [
        {
            id: 'first_spark',
            name: 'First Spark',
            description: 'Completed 1 Daily Dare challenge.',
            emoji: '⚡',
            color: 'from-amber-400 to-orange-500',
            unlocked: daresCompleted >= 1
        },
        {
            id: 'flare_igniter',
            name: 'Flare Igniter',
            description: 'Reached a 3-day Sync Flare Streak.',
            emoji: '🔥',
            color: 'from-orange-500 to-rose-600',
            unlocked: syncStreak >= 3
        },
        {
            id: 'vibe_alchemist',
            name: 'Vibe Alchemist',
            description: 'Reached a 7-day Sync Flare Streak.',
            emoji: '🧪',
            color: 'from-purple-500 to-indigo-600',
            unlocked: syncStreak >= 7
        },
        {
            id: 'sync_emperor',
            name: 'Sync Emperor',
            description: 'Completed 10 total Daily Dares.',
            emoji: '👑',
            color: 'from-pink-500 to-rose-500 bg-clip-border shadow-pink-500/30',
            unlocked: daresCompleted >= 10
        },
        {
            id: 'harmony_guardian',
            name: 'Harmony Guardian',
            description: 'Saved 1 or more recommended replies.',
            emoji: '🛡️',
            color: 'from-emerald-400 to-teal-600',
            unlocked: (user.savedReplies?.length || 0) > 0
        },
        {
            id: 'unlimited_syncer',
            name: 'Unlimited Syncer',
            description: 'Active Premium Launch user.',
            emoji: '✨',
            color: 'from-cyan-400 to-blue-600',
            unlocked: user.isPremium
        }
    ];

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.[0]?.toUpperCase() || '?';

    const copyInviteText = () => {
        const text = `Check out Sync AI! Level up your texting confidence, unlock witty Hinglish replies, and test your Rizz at https://syncai.live! Follow @syncai.live on Instagram. 🔥`;
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0f] pb-32 animate-in fade-in duration-500">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 pt-16 pb-8 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
                {/* Visual decoration overlay */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
                <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                    <div className="w-24 h-24 bg-white dark:bg-[#12121a]/30 backdrop-blur-xl rounded-full flex items-center justify-center text-4xl font-black text-rose-600 dark:text-white border-4 border-white/30 shadow-2xl transition-transform hover:scale-105 duration-300">
                        {initials}
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-white">{user.name || 'Sync User'}</h2>
                        <p className="text-pink-100 text-xs font-semibold opacity-85">{user.email}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-6 -mt-6">
                
                {/* --- Gamified Sync Level Banner --- */}
                <div className="mb-6 bg-gradient-to-r from-[#171725] to-[#0c0c16] text-white p-5 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-8 -bottom-8 opacity-5">
                        <Trophy size={96} />
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                        <div className="space-y-0.5">
                            <span className="text-[9px] uppercase tracking-widest font-black text-pink-500">Sync Rank Level</span>
                            <h4 className="text-base font-black flex items-center gap-1.5">
                                <span>{currentLevel}</span>
                                <span className="text-xs bg-pink-500/20 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded-full">Lvl {levelIndex}</span>
                            </h4>
                        </div>
                        <Crown size={22} className="text-yellow-400 drop-shadow-[0_2px_8px_rgba(234,179,8,0.3)]" />
                    </div>
                    
                    {/* XP Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 transition-all duration-1000"
                                style={{ width: `${xpPercent}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>{daresCompleted} Completed Dares</span>
                            <span>{nextLevel} (Lvl {levelIndex + 1})</span>
                        </div>
                    </div>
                </div>

                {/* Credit Status */}
                <div className="mb-6 bg-white dark:bg-[#12121a] rounded-3xl shadow-md border border-gray-100 dark:border-white/5 overflow-hidden">
                    <CreditsBar
                        credits={user.credits}
                        maxCredits={user.isPremium ? 50 : 10}
                        isPremium={user.isPremium}
                        onUpgrade={undefined}
                    />
                </div>

                {/* Gamified Core Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white dark:bg-[#12121a] p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 text-center space-y-0.5">
                        <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sync Streak</p>
                        <div className="flex items-center justify-center space-x-0.5 text-rose-500 font-black">
                            <Flame size={14} className="fill-rose-500/10" />
                            <p className="text-sm">{syncStreak}d</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#12121a] p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 text-center space-y-0.5">
                        <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">XP Rating</p>
                        <div className="flex items-center justify-center space-x-0.5 text-purple-500 font-black">
                            <Sparkles size={14} />
                            <p className="text-sm">{daresCompleted * 100} XP</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#12121a] p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 text-center space-y-0.5">
                        <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Saved Replies</p>
                        <div className="flex items-center justify-center space-x-0.5 text-blue-500 font-black">
                            <MessageCircle size={14} />
                            <p className="text-sm">{user.savedReplies?.length || 0}</p>
                        </div>
                    </div>
                </div>

                {/* --- Interactive Badges Section --- */}
                <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Unlocked Sync Badges</h3>
                        <span className="text-[9px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-gray-200 dark:border-white/5">
                            {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {badges.map((badge) => (
                            <div 
                                key={badge.id}
                                className={`p-3 bg-white dark:bg-[#12121a] rounded-2xl border flex flex-col items-center justify-center text-center relative group transition-all duration-300 ${
                                    badge.unlocked 
                                        ? 'border-gray-200 dark:border-white/5 shadow-sm hover:scale-[1.03] hover:shadow-md' 
                                        : 'border-dashed border-gray-200 dark:border-white/5 opacity-55'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${badge.unlocked ? badge.color : 'from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900'} flex items-center justify-center text-xl shadow-inner mb-1.5`}>
                                    {badge.unlocked ? badge.emoji : <Lock size={14} className="text-gray-400 dark:text-gray-600" />}
                                </div>
                                <span className={`text-[10px] font-black tracking-tight ${badge.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {badge.name}
                                </span>

                                {/* Tooltip detailing unlock instructions */}
                                <div className="absolute bottom-full mb-2 hidden group-hover:block w-40 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-[9px] p-2 rounded-xl shadow-xl z-20 pointer-events-none leading-relaxed">
                                    <span className="font-extrabold block text-[10px] border-b border-white/10 dark:border-black/10 pb-1 mb-1">{badge.name}</span>
                                    {badge.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Interactive Share Card --- */}
                <div className="mb-6 bg-gradient-to-br from-[#12121e] to-[#0a0a0f] border border-white/5 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col items-center text-center space-y-3">
                        <Award className="text-rose-500 fill-rose-500/10" size={32} />
                        <h4 className="text-sm font-black tracking-tight">Sync AI Poster Card</h4>
                        <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed">
                            Tag us on your stories! Invite friends to practice communication and claim unlimited free launch credits.
                        </p>

                        <div className="flex gap-2 w-full pt-1">
                            <button
                                onClick={copyInviteText}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-[0.98]"
                            >
                                {isCopied ? <Check size={14} className="text-green-400 animate-pulse" /> : <Copy size={14} />}
                                <span>{isCopied ? 'Copied' : 'Share Poster'}</span>
                            </button>

                            <a
                                href="https://www.instagram.com/syncai.live"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 hover:opacity-90 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-[0.98]"
                            >
                                <Instagram size={14} />
                                <span>Follow @syncai.live</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Menu Sections */}
                <div className="mt-8 space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-4">Account Settings</h3>
                        <div className="bg-white dark:bg-[#12121a] rounded-[32px] overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
                            <MenuButton icon={MessageCircle} label="Saved Replies" onClick={onOpenSaved} color="text-blue-500" bgColor="bg-blue-50" />
                            <MenuButton icon={Shield} label="Privacy & Security" onClick={() => { }} color="text-teal-500" bgColor="bg-teal-50" />
                        </div>
                    </div>

                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center space-x-2 py-4 bg-red-50 hover:bg-red-100/80 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-3xl font-black text-sm uppercase tracking-widest transition-colors active:scale-[0.98]"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>

                    <div className="text-center pt-4">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sync AI v1.2.0</p>
                        <p className="text-[10px] text-gray-400 mt-1 italic">Made with ❤️ for modern dating • syncai.live</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MenuButton: React.FC<{ icon: any, label: string, onClick: () => void, color: string, bgColor: string, value?: string }> = ({
    icon: Icon, label, onClick, color, bgColor, value
}) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 last:border-none group text-left"
    >
        <div className="flex items-center space-x-4">
            <div className={`p-2.5 rounded-2xl ${bgColor} ${color} transition-transform group-hover:scale-110`}>
                <Icon size={20} />
            </div>
            <div className="flex flex-col">
                <span className="font-semibold text-gray-700 dark:text-gray-200">{label}</span>
                {value && <span className="text-[10px] font-medium text-gray-400">{value}</span>}
            </div>
        </div>
        <ChevronRight size={18} className="text-gray-300" />
    </button>
);

export default ProfileSection;
