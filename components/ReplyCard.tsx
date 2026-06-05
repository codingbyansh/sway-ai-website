import React, { useState } from 'react';
import { Copy, Check, Heart } from 'lucide-react';
import { ReplyOption } from '../types';

interface ReplyCardProps {
  reply: ReplyOption;
  onSave?: (reply: ReplyOption) => void;
}

const ReplyCard: React.FC<ReplyCardProps> = ({ reply, onSave }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reply.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(reply);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'Safe': return 'bg-green-100 text-green-700 border-green-200';
      case 'Balanced': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Bold': return 'bg-sync-100 text-sync-700 border-sync-200';
      default: return 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-[#12121a] rounded-2xl p-5 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow relative group">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border ${getStyleColor(reply.style)}`}>
          {reply.style}
        </span>
      </div>

      <p className="text-gray-800 dark:text-gray-100 text-base font-semibold leading-relaxed pr-8">
        "{reply.text}"
      </p>

      <div className="flex items-center justify-end mt-4 space-x-2 border-t border-gray-50 dark:border-white/5 pt-3">
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-xs font-semibold"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-500" />
              <span className="text-green-600">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>

        {onSave && (
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 transition-colors text-xs font-semibold"
          >
            <Heart size={14} className={saved ? "fill-pink-500 text-pink-500" : ""} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ReplyCard;