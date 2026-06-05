
import React, { useState, useRef, useEffect } from 'react';
import { Star, Ghost, HeartHandshake, LogOut, User as UserIcon, Crown, ChevronDown, Sparkles, Menu, MessageCircle, Sun, Moon } from 'lucide-react';
import { UserCredits, User } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  credits: UserCredits;
  onOpenPremium: () => void;
  onOpenGhosting: () => void;
  onOpenConflict: () => void;
  onOpenSavedReplies: () => void;
  onOpenProfile: () => void;
  user: User;
  onLogout: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ credits, onOpenPremium, onOpenGhosting, onOpenConflict, onOpenSavedReplies, onOpenProfile, user, onLogout, onToggleSidebar, isSidebarOpen, isDarkMode, toggleTheme }) => {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user.name
    ? user.name.split(' ').map(n => n?.[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0f] backdrop-blur-md border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Left Side: Hamburger (Laptop) + Logo + Brand Name */}
        <div className="flex items-center relative z-10 gap-2">
          <button
            onClick={onToggleSidebar}
            className="hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-700 dark:text-gray-300 flex items-center justify-center p-2"
          >
            <Menu size={24} />
          </button>

          <div className="opacity-100 flex items-center gap-2">
            <Logo className="w-8 h-8 md:w-10 md:h-10 shrink-0" />
            <span className="font-bold text-lg md:text-2xl tracking-tight bg-gradient-to-r from-red-500 via-pink-500 to-rose-600 bg-clip-text text-transparent drop-shadow-sm select-none">
              SYNC AI
            </span>
          </div>
        </div>


        {/* Right Side: Simple Actions */}
        <div className="flex items-center space-x-3">
          {!credits.isPremium && (
            <button
              onClick={onOpenPremium}
              className="hidden sm:flex items-center space-x-2 bg-pink-50 text-pink-600 px-3 py-1.5 rounded-full border border-pink-100 hover:bg-pink-100 transition-colors"
            >
              <Sparkles size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Upgrade</span>
            </button>
          )}

          {/* Theme Toggle Button (Visible on Mobile & Desktop) */}
          <button
            onClick={toggleTheme}
            className="flex w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 items-center justify-center text-gray-400 dark:text-gray-300 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => onOpenSavedReplies()}
            className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-300 transition-colors"
            title="Saved Replies"
          >
            <MessageCircle size={20} />
          </button>

          {/* Mobile-Precise Profile Button */}
          <button
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-300 transition-colors"
            title="Profile"
          >
            <UserIcon size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
