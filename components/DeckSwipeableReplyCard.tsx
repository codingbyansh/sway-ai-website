import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Check, X, Copy, Heart, Sparkles } from 'lucide-react';
import { ReplyOption } from '../types';

interface DeckSwipeableReplyCardProps {
  reply: ReplyOption;
  onAccept?: (reply: ReplyOption) => void;
  onReject?: (reply: ReplyOption) => void;
  onNext?: () => void;
}

const DeckSwipeableReplyCard: React.FC<DeckSwipeableReplyCardProps> = ({
  reply,
  onAccept,
  onReject,
  onNext,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const controls = useAnimation();

  const handleDragEnd = async (event: any, info: any) => {
    if (info.offset.x > 120) {
      await controls.start({ x: 500, opacity: 0 });
      if (onAccept) onAccept(reply);
      if (onNext) onNext();
    } else if (info.offset.x < -120) {
      await controls.start({ x: -500, opacity: 0 });
      if (onReject) onReject(reply);
      if (onNext) onNext();
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(reply.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAccept) {
      onAccept(reply);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'Safe': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'Balanced': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Bold': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default: return 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="relative w-full select-none" style={{ height: 260 }}>
      <motion.div
        drag="x"
        style={{ x, rotate, opacity, position: 'absolute', inset: 0 }}
        animate={controls}
        onDragEnd={handleDragEnd}
        className="bg-white dark:bg-[#12121a] rounded-3xl shadow-xl border border-gray-150 dark:border-white/5 p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing"
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1.5">
              <Sparkles size={13} className="text-pink-500 animate-pulse" />
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-gray-400">
                SUGGESTION
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStyleColor(reply.style)}`}>
              {reply.style} Style
            </span>
          </div>

          <p className="text-base md:text-lg font-bold leading-relaxed italic text-gray-800 dark:text-gray-100 pr-4">
            "{reply.text}"
          </p>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-white/5">
          {/* Action Helper Hints */}
          <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider gap-3">
            <span className="flex items-center"><X size={10} className="mr-0.5 text-red-500" /> Swipe Left to Reject</span>
            <span className="flex items-center"><Check size={10} className="mr-0.5 text-green-500" /> Swipe Right to Save</span>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 rounded-xl transition-all"
              title="Copy reply text"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
            <button
              onClick={handleSave}
              className="p-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 rounded-xl transition-all"
              title="Save reply"
            >
              <Heart size={16} className={saved ? "fill-pink-500 text-pink-500" : ""} />
            </button>
          </div>
        </div>

        {/* Visual Swiping Indicators */}
        <motion.div
          style={{ opacity: useTransform(x, [0, 80], [0, 1]) }}
          className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg"
        >
          <Check size={20} />
        </motion.div>
        <motion.div
          style={{ opacity: useTransform(x, [0, -80], [0, 1]) }}
          className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full shadow-lg"
        >
          <X size={20} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DeckSwipeableReplyCard;
