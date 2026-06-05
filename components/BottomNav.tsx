
import React from 'react';
import { MessageCircle, Ghost, HeartHandshake, User, Swords, Compass, Flame } from 'lucide-react';

interface BottomNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isPremium: boolean;
    onOpenPremium: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, isPremium, onOpenPremium }) => {
    const tabs = [
        { id: 'replies', label: 'Replies', icon: MessageCircle, color: 'text-pink-500' },
        { id: 'practice', label: 'Practice', icon: Swords, color: 'text-amber-500' },
        { id: 'wheel', label: 'Wheel', icon: Compass, color: 'text-purple-500' },
        { id: 'daily-dare', label: 'Dare', icon: Flame, color: 'text-rose-500' },
        { id: 'profile', label: 'Profile', icon: User, color: 'text-blue-500' },
    ];

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-white/5 pb-safe md:hidden">
            <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${isActive ? 'text-pink-500' : 'text-gray-500'
                                }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-pink-500/10 scale-105 shadow-md shadow-pink-500/10' : ''}`}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

};

export default BottomNav;
