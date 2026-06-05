
import React, { useState } from 'react';
import { ArrowLeft, Ghost, Sparkles, Copy, Check, AlertCircle, Smile, Type as TypeIcon, Globe } from 'lucide-react';
import Button from './Button';
import { recoverFromGhosting } from '../services/geminiService';
import { GhostingResponse, GhostingReply, Language, TextStyle, User } from '../types';
import SwipeableGhostingCard from './SwipeableGhostingCard';
import { LANGUAGE_LABELS } from '../constants';
import { userService } from '../services/userService';

interface GhostingRecoveryProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
  isTabMode?: boolean;
}

const GhostingRecovery: React.FC<GhostingRecoveryProps> = ({ user, onUpdateUser, onClose, isTabMode }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [gender, setGender] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [language, setLanguage] = useState<Language>(Language.HINGLISH);
  const [textStyle, setTextStyle] = useState<TextStyle>(TextStyle.STANDARD);
  const [useEmojis, setUseEmojis] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GhostingResponse | null>(null);
  const [currentReplyIndex, setCurrentReplyIndex] = useState(0);

  const handleSubmit = async () => {
    if (!gender || !details.trim()) return;

    if (user.credits <= 0) {
      alert("You have run out of credits for today!");
      return;
    }

    setLoading(true);
    setStep(2);

    try {
      const data = await recoverFromGhosting(gender, details, language, textStyle, useEmojis);
      setResult(data);
      setCurrentReplyIndex(0);
      setStep(3);

      const updatedUser = await userService.deductCredit(user.email);
      onUpdateUser(updatedUser);
    } catch (error) {
      console.error(error);
      setStep(1);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isTabMode ? '' : 'fixed inset-0 z-50'} flex flex-col bg-[#fafafa] dark:bg-[#0a0a0f]`}>
      {/* Navbar for Ghosting Page */}
      {!isTabMode && (
        <header className="sticky top-0 z-50 bg-white dark:bg-[#12121a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 flex-none">
          <div className="max-w-4xl mx-auto px-3 h-14 flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 dark:bg-white/5 rounded-full transition-colors"
            >
              <ArrowLeft size={18} className="text-gray-700 dark:text-gray-200" />
            </button>
            <div className="flex items-center space-x-2">
              <Ghost size={18} className="text-black" />
              <span className="font-bold text-sm text-black">Ghosting Rescue</span>
            </div>
            <div className="w-10"></div>
          </div>
        </header>
      )}

      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-3 py-4 pb-24">

          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Let's get them back.</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tell us about the situation and we'll craft the perfect revival text.</p>
              </div>

              <div className="bg-white dark:bg-[#12121a] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">

                {/* Gender Select */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-900 dark:text-white">Who ghosted you?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`py-2 px-3 rounded-xl border-2 text-xs font-medium transition-all ${gender === g
                          ? 'border-black bg-black text-white'
                          : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                          }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-900 dark:text-white">What happened?</label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="e.g., We went on 2 dates, texted for a week, then he stopped replying..."
                    className="w-full h-24 p-3 rounded-xl border-2 border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 resize-none focus:outline-none focus:border-black focus:bg-white dark:bg-[#12121a] transition-all text-xs text-gray-700 dark:text-gray-200"
                  />
                </div>

                {/* Preferences Section */}
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-white/5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customize Reply</span>

                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 flex items-center">
                      <Globe size={10} className="mr-1" /> Language
                    </label>
                    <div className="flex space-x-1.5 overflow-x-auto pb-1">
                      {Object.values(Language).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all border whitespace-nowrap ${language === lang
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white dark:bg-[#12121a] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 dark:bg-white/5'
                            }`}
                        >
                          {LANGUAGE_LABELS[lang]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Text Style */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 flex items-center">
                        <TypeIcon size={10} className="mr-1" /> Style
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.values(TextStyle).map((style) => (
                          <button
                            key={style}
                            onClick={() => setTextStyle(style)}
                            className={`flex-grow py-1 px-1.5 text-[10px] font-medium rounded-md border transition-all ${textStyle === style
                              ? 'bg-black text-white border-black'
                              : 'bg-white dark:bg-[#12121a] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:border-gray-300'
                              }`}
                          >
                            {style.split('/')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Emojis */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 flex items-center">
                        <Smile size={10} className="mr-1" /> Emojis
                      </label>
                      <div className="flex bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg">
                        <button
                          onClick={() => setUseEmojis(true)}
                          className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${useEmojis
                            ? 'bg-white dark:bg-[#12121a] text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200'
                            }`}
                        >
                          On 😜
                        </button>
                        <button
                          onClick={() => setUseEmojis(false)}
                          className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${!useEmojis
                            ? 'bg-white dark:bg-[#12121a] text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200'
                            }`}
                        >
                          Off
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  fullWidth
                  onClick={handleSubmit}
                  disabled={!gender || !details.trim()}
                  className="bg-black hover:bg-gray-800 text-white shadow-none h-11 text-sm"
                >
                  <Sparkles size={16} className="mr-2" />
                  Generate Recovery Texts
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
              <div className="w-12 h-12 border-4 border-gray-200 dark:border-white/5 border-t-black rounded-full animate-spin"></div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Analyzing the silence...</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Calculating recovery probabilities.</p>
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div className="space-y-4">
              {/* Analysis */}
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="font-bold text-orange-900 dark:text-orange-300 text-[10px] uppercase tracking-wide mb-0.5">Diagnosis</h4>
                  <p className="text-orange-800 dark:text-orange-200 text-xs leading-relaxed">{result.analysis}</p>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Suggested Replies</h3>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {currentReplyIndex + 1} of {result.replies.length}
                  </span>
                </div>

                <div className="relative">
                  {result.replies[currentReplyIndex] ? (
                    <SwipeableGhostingCard
                      key={result.replies[currentReplyIndex].id}
                      reply={result.replies[currentReplyIndex]}
                      onAccept={async (reply) => {
                        try {
                          const updatedUser = await userService.saveReply(user.email, reply.text, 'Ghosting');
                          if (updatedUser) onUpdateUser(updatedUser);
                        } catch (err: any) {
                          alert(err.message);
                        }
                      }}
                      onNext={() => {
                        if (currentReplyIndex < result.replies.length - 1) {
                          setCurrentReplyIndex(currentReplyIndex + 1);
                        } else {
                          setStep(1);
                        }
                      }}
                    />
                  ) : (
                    <div className="bg-gray-50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl h-[200px] flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                        <Check size={24} className="text-green-600" />
                      </div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">All Done!</h3>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">You've swiped through all choices.</p>
                      <button
                        onClick={() => setStep(1)}
                        className="mt-4 px-5 py-1.5 bg-black text-white rounded-full text-xs font-bold shadow-md hover:bg-gray-800 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setStep(1)}
                  className="border-gray-300 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 dark:bg-white/5 text-xs h-10"
                >
                  Try Different Details
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GhostingRecovery;
