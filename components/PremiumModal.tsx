import React, { useEffect } from 'react';
import { X, Sparkles, Crown, Zap, Heart, Check } from 'lucide-react';
import { User } from '../types';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (result: { isPremium?: boolean; bonusCredits?: number }) => void;
  user: User;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, user }) => {
  useEffect(() => {
    if (isOpen) {
      console.log("Premium Launch Promo Modal Opened!");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="min-h-[100dvh] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

        {/* Card */}
        <div className="relative w-full max-w-[440px] bg-gradient-to-b from-[#1c0d15] to-[#12070d] rounded-[36px] shadow-[0_0_50px_rgba(236,72,153,0.15)] border border-pink-500/20 p-6 flex flex-col gap-6 my-8 animate-in zoom-in-95 duration-200">
          
          {/* Glowing Top Aura */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent blur-md" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-500 dark:text-gray-400 hover:text-white hover:bg-white dark:bg-[#12121a]/5 p-1.5 rounded-full transition-all"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3 pt-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl blur opacity-30 animate-pulse" />
              <div className="relative w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center border border-pink-500/30">
                <Crown size={32} className="text-pink-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Sync AI <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Premium</span>
              </h2>
              <div className="inline-flex items-center gap-1.5 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                <Sparkles size={12} className="text-pink-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Launch Celebration Offer</span>
              </div>
            </div>
          </div>

          {/* Announcement Banner */}
          <div className="bg-gradient-to-br from-pink-600/10 to-rose-600/5 border border-pink-500/20 rounded-2xl p-4 space-y-2 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-500/5 rounded-full blur-xl" />
            <div className="flex items-center gap-2 text-pink-400">
              <Heart size={16} className="fill-current animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider">100% Free For Everyone</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Welcome to the future of dating! During our launch period, we are giving everyone <strong>free, unlimited access</strong> to Sync AI Premium. Enjoy the complete Sync AI toolkit with no credit cards, subscriptions, or hidden charges.
            </p>
          </div>

          {/* Plan Perks Checklist */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Your Active Benefits</h3>
            
            <div className="grid gap-2">
              {[
                { title: 'Unlimited AI Credits', desc: 'No daily generation restrictions', icon: Zap },
                { title: 'Unlimited Saved Replies', desc: 'Keep all your best replies ready', icon: Heart },
                { title: 'Full Dating Suite Access', desc: 'Replies, Ghosting & Talk-it-out tools included', icon: Crown },
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 bg-white dark:bg-[#12121a]/5 rounded-xl p-3 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/15 shrink-0">
                    <benefit.icon size={15} className="text-pink-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white leading-none mb-0.5">{benefit.title}</span>
                    <span className="text-[10px] text-gray-400 leading-none">{benefit.desc}</span>
                  </div>
                  <Check size={14} className="text-emerald-400 ml-auto shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={onClose}
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 active:scale-[0.98] transition-all text-sm"
            >
              Start Chatting with Confidence
            </button>
            <p className="text-[9px] text-center text-gray-500 dark:text-gray-400">
              Launch promo active. Sync AI reserves the right to introduce premium plans/ads in the future.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PremiumModal;