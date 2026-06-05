
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Ghost, HeartHandshake, User, X, LogOut, Crown, Swords, Compass, Flame } from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    user: any;
    onLogout: () => void;
    className?: string; // Added for flexible layouts
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, setActiveTab, user, onLogout, className = "" }) => {
    const tabs = [
        { id: 'replies', label: 'Replies', icon: MessageCircle, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
        { id: 'practice', label: 'Practice Arena', icon: Swords, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
        { id: 'wheel', label: 'Icebreaker Wheel', icon: Compass, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
        { id: 'daily-dare', label: 'Daily Dare', icon: Flame, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
        { id: 'ghosting', label: 'Ghosting', icon: Ghost, color: 'text-gray-900 dark:text-gray-100', bgColor: 'bg-black/5 dark:bg-white/5' },
        { id: 'talkitout', label: 'Talk It Out', icon: HeartHandshake, color: 'text-teal-600', bgColor: 'bg-teal-500/10' },
        { id: 'profile', label: 'User Profile', icon: User, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    ];

    const sidebarVariants = {
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
    };

    const overlayVariants = {
        open: { opacity: 1 },
        closed: { opacity: 0 }
    };

    const SidebarContent = (
        <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className={`w-72 bg-white dark:bg-[#0c0c14] flex flex-col border-r border-gray-100 dark:border-white/5 h-full transition-colors duration-300 ${className}`}
        >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-50 dark:border-white/5 bg-white dark:bg-[#0c0c14] sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                    <div className="p-1 rounded-full bg-gradient-to-br from-pink-50 to-rose-50 shadow-sm">
                        <Logo className="w-14 h-14" />
                    </div>
                    <span className="font-black text-2xl md:text-2xl md:text-3xl tracking-tighter bg-gradient-to-r from-pink-500 via-rose-600 to-red-600 bg-clip-text text-transparent drop-shadow-sm">
                        SYNC AI
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all duration-200 text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white group"
                    title="Close Sidebar"
                >
                    <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            {/* User Info Wrapper (Brief) */}
            <div className="p-6 bg-gray-50/50 dark:bg-white/5 m-4 rounded-3xl border border-gray-100 dark:border-white/5">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{user.name || 'Sync AI User'}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>
                {user.isPremium && (
                    <div className="mt-3 flex items-center space-x-1 justify-center py-1 bg-pink-100 text-pink-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <Crown size={10} />
                        <span>Premium Member</span>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-thin">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (window.innerWidth < 1024) onClose();
                            }}
                            className={`w-full flex items-center space-x-3 p-4 rounded-2xl transition-all duration-200 group ${isActive
                                ? `${tab.bgColor} ${tab.color} shadow-sm`
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <div className={`transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`font-bold text-sm ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                {tab.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active-indicator"
                                    className={`ml-auto w-1.5 h-1.5 rounded-full ${tab.color.replace('text-', 'bg-')}`}
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-50 dark:border-white/5">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 p-4 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all group"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Sign Out</span>
                </button>
            </div>
        </motion.aside>
    );

    return (
        <>
            {/* Desktop Persistent Sidebar (Static) */}
            <div className={`hidden lg:block h-screen sticky top-0 bg-white transition-all duration-300 ease-in-out border-r border-gray-100 overflow-hidden ${isOpen ? 'w-72' : 'w-0'}`}>
                <div className="w-72 h-full">
                    {SidebarContent}
                </div>
            </div>

            {/* Mobile/Tablet Drawer (Fixed Overlay) */}
            <AnimatePresence>
                {isOpen && (
                    <div className="lg:hidden">
                        {/* Overlay */}
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={overlayVariants}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                        />

                        {/* Sidebar wrapper to handle fixed positioning for drawer */}
                        <div className="fixed top-0 left-0 bottom-0 z-[70] h-full shadow-2xl">
                            {SidebarContent}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
