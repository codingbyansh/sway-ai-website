
import React from 'react';
import { Tone, Language, TextStyle } from '../types';
import { TONE_DESCRIPTIONS, LANGUAGE_LABELS } from '../constants';
import { Smile, Type as TypeIcon } from 'lucide-react';

interface OptionsSelectorProps {
  selectedTone: Tone;
  setSelectedTone: (tone: Tone) => void;
  selectedLanguage: Language;
  setSelectedLanguage: (lang: Language) => void;
  useEmojis: boolean;
  setUseEmojis: (use: boolean) => void;
  textStyle: TextStyle;
  setTextStyle: (style: TextStyle) => void;
}

const OptionsSelector: React.FC<OptionsSelectorProps> = ({
  selectedTone,
  setSelectedTone,
  selectedLanguage,
  setSelectedLanguage,
  useEmojis,
  setUseEmojis,
  textStyle,
  setTextStyle
}) => {
  return (
    <div id="tour-options" className="space-y-6">
      {/* Tone Selection */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Vibe Check</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.values(Tone).map((tone) => (
            <button
              key={tone}
              onClick={() => setSelectedTone(tone)}
              className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden h-full flex flex-col justify-between ${selectedTone === tone
                ? 'border-sync-500 bg-sync-50 text-sync-900 ring-1 ring-sync-500'
                : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#12121a] text-gray-600 dark:text-gray-300 hover:border-gray-300'
                }`}
            >
              <div className="text-sm font-semibold truncate">{tone}</div>
              <div className="text-[10px] opacity-70 leading-tight mt-1 line-clamp-2">
                {TONE_DESCRIPTIONS[tone]}
              </div>
              {selectedTone === tone && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-sync-500 rounded-bl-lg" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Formatting & Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Text Style */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 flex items-center">
            <TypeIcon size={12} className="mr-1" /> Text Format
          </label>
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
            {Object.values(TextStyle).map((style) => (
              <button
                key={style}
                onClick={() => setTextStyle(style)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${textStyle === style
                  ? 'bg-white dark:bg-[#12121a] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200'
                  }`}
              >
                {style.split('/')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Emojis Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 flex items-center">
            <Smile size={12} className="mr-1" /> Emojis
          </label>
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setUseEmojis(true)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${useEmojis
                ? 'bg-white dark:bg-[#12121a] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200'
                }`}
            >
              On 😜
            </button>
            <button
              onClick={() => setUseEmojis(false)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${!useEmojis
                ? 'bg-white dark:bg-[#12121a] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200'
                }`}
            >
              Off
            </button>
          </div>
        </div>
      </div>

      {/* Language Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Language</label>
        <div className="flex space-x-2">
          {Object.values(Language).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border ${selectedLanguage === lang
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white dark:bg-[#12121a] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 dark:bg-white/5 dark:hover:bg-white/5 dark:bg-white/5'
                }`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptionsSelector;
