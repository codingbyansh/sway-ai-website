
import React, { useState } from 'react';
import {
  ArrowLeft, HeartHandshake, Sparkles, Copy, Check,
  AlertCircle, MessageCircle, Heart, Shield, Clock, Globe
} from 'lucide-react';
import Button from './Button';
import { resolveConflict } from '../services/geminiService';
import { ConflictProfile, ConflictResolutionResponse, Language, User } from '../types';
import { LANGUAGE_LABELS } from '../constants';
import { userService } from '../services/userService';

interface ConflictResolutionModalProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
  isTabMode?: boolean;
}

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({ user, onUpdateUser, onClose, isTabMode }) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConflictResolutionResponse | null>(null);

  // Form State
  const [profile, setProfile] = useState<ConflictProfile>({
    userGender: '',
    partnerGender: '',
    relationshipType: '',
    duration: '',
    reason: '',
    userFeeling: '',
    partnerFeeling: '',
    description: '',
    language: Language.HINGLISH
  });

  const updateProfile = (field: keyof ConflictProfile, value: string | Language) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (user.credits <= 0) {
      alert("You have run out of credits for today!");
      return;
    }

    setLoading(true);
    setStep(4); // Loading view

    try {
      const data = await resolveConflict(profile);
      setResult(data);
      setStep(5); // Results view

      const updatedUser = await userService.deductCredit(user.email);
      onUpdateUser(updatedUser);
    } catch (error) {
      console.error(error);
      setStep(3); // Go back to last input step
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = profile.userGender && profile.partnerGender && profile.relationshipType && profile.duration;
  const isStep2Valid = profile.reason && profile.userFeeling && profile.partnerFeeling;
  const isStep3Valid = profile.description.trim().length > 0;

  return (
    <div className={`${isTabMode ? '' : 'fixed inset-0 z-50'} flex flex-col bg-[#f8fafc] dark:bg-[#0a0a0f]`}>
      {/* Navbar */}
      {!isTabMode && (
        <header className="sticky top-0 z-50 bg-white dark:bg-[#12121a]/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5 flex-none">
          <div className="max-w-4xl mx-auto px-3 h-14 flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-700 dark:text-gray-200" />
            </button>
            <div className="flex items-center space-x-2">
              <HeartHandshake size={18} className="text-teal-600" />
              <span className="font-bold text-sm text-slate-800 dark:text-gray-100">Talk It Out</span>
            </div>
            <div className="w-10"></div>
          </div>
        </header>
      )}

      <div className="flex-1">
        <div className="max-w-xl mx-auto px-3 py-4 pb-24">

          {/* STEP 1: Identity & Context */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Let's cool things down.</h1>
                <p className="text-xs text-slate-500 dark:text-gray-400">Help us understand the relationship context first.</p>
              </div>

              <div className="bg-white dark:bg-[#12121a] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 space-y-4">

                {/* Genders */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-900 dark:text-white">I am...</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map(g => (
                      <OptionButton
                        key={g}
                        label={g}
                        selected={profile.userGender === g}
                        onClick={() => updateProfile('userGender', g)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-900 dark:text-white">My partner is...</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map(g => (
                      <OptionButton
                        key={g}
                        label={g}
                        selected={profile.partnerGender === g}
                        onClick={() => updateProfile('partnerGender', g)}
                      />
                    ))}
                  </div>
                </div>

                {/* Relationship Type */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-900 dark:text-white">Relationship Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Dating', 'Serious', 'Committed', 'Married'].map(r => (
                      <OptionButton
                        key={r}
                        label={r}
                        selected={profile.relationshipType === r}
                        onClick={() => updateProfile('relationshipType', r)}
                      />
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-900 dark:text-white">How long together?</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['< 3 mos', '3-12 mos', '1-3 yrs', '3+ yrs'].map(d => (
                      <OptionButton
                        key={d}
                        label={d}
                        selected={profile.duration === d}
                        onClick={() => updateProfile('duration', d)}
                        small
                      />
                    ))}
                  </div>
                </div>

                <Button
                  fullWidth
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                  className="bg-teal-600 hover:bg-teal-700 text-white shadow-teal-100 h-11 text-sm"
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: The Fight */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">What's going on?</h1>
                <p className="text-xs text-slate-500 dark:text-gray-400">Pinpoint the feelings to fix the misunderstanding.</p>
              </div>

              <div className="bg-white dark:bg-[#12121a] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 space-y-4">

                {/* Reason */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-900 dark:text-white">Main source of conflict?</label>
                  <select
                    value={profile.reason}
                    onChange={(e) => updateProfile('reason', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Miscommunication">Miscommunication</option>
                    <option value="Time / Attention">Time / Attention</option>
                    <option value="Trust / Insecurity">Trust / Insecurity</option>
                    <option value="Tone / Words hurt">Tone / Words hurt</option>
                    <option value="Jealousy">Jealousy</option>
                    <option value="Family / External Pressure">Family / External Pressure</option>
                    <option value="Expectations Mismatch">Expectations Mismatch</option>
                    <option value="Ego / Stubbornness">Ego / Stubbornness</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Feelings */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-900 dark:text-white">How do you feel?</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Angry 😡', 'Hurt 😢', 'Confused 😕', 'Guilty 😔', 'Calm 😐'].map(f => (
                      <button
                        key={f}
                        onClick={() => updateProfile('userFeeling', f)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${profile.userFeeling === f
                          ? 'bg-teal-50 dark:bg-teal-950/20 border-teal-500 dark:border-teal-400 text-teal-700 dark:text-teal-200'
                          : 'bg-white dark:bg-[#12121a] border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5'
                          }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-900 dark:text-white">How does partner feel (guess)?</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Angry 😡', 'Hurt 😢', 'Silent 😶', 'Defensive 🛡️', 'Unknown 🤷'].map(f => (
                      <button
                        key={f}
                        onClick={() => updateProfile('partnerFeeling', f)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${profile.partnerFeeling === f
                          ? 'bg-teal-50 dark:bg-teal-950/20 border-teal-500 dark:border-teal-400 text-teal-700 dark:text-teal-200'
                          : 'bg-white dark:bg-[#12121a] border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5'
                          }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button
                    className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => setStep(3)}
                    disabled={!isStep2Valid}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Input */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">In your own words</h1>
                <p className="text-xs text-slate-500 dark:text-gray-400">Paste the chat or describe what happened briefly.</p>
              </div>

              <div className="bg-white dark:bg-[#12121a] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 space-y-4">
                <textarea
                  value={profile.description}
                  onChange={(e) => updateProfile('description', e.target.value)}
                  placeholder="e.g. He said he was busy but I saw him online..."
                  className="w-full h-28 p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs text-slate-700 dark:text-gray-200"
                />

                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 flex items-center uppercase tracking-wider">
                    <Globe size={10} className="mr-1" /> Language for Replies
                  </label>
                  <div className="flex space-x-2">
                    {Object.values(Language).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => updateProfile('language', lang)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-medium transition-all border ${profile.language === lang
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-100'
                          : 'bg-white dark:bg-[#12121a] text-slate-600 dark:text-gray-300 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5'
                          }`}
                      >
                        {LANGUAGE_LABELS[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
                  <Button
                    className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={handleSubmit}
                    disabled={!isStep3Valid}
                  >
                    <Sparkles size={18} className="mr-2" />
                    Resolve Conflict
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Loading */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center animate-in fade-in">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 dark:border-white/5 border-t-teal-500 rounded-full animate-spin"></div>
                <HeartHandshake className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-teal-500" size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Finding common ground...</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 max-w-xs mx-auto">Analyzing emotional tones and drafting peaceful resolutions.</p>
              </div>
            </div>
          )}

          {/* STEP 5: Results */}
          {step === 5 && result && (
            <div className="space-y-4">

              {/* Insight Badge */}
              <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 p-3 rounded-xl flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <div className="bg-teal-100 dark:bg-teal-950/40 p-1.5 rounded-full">
                    <HeartHandshake className="text-teal-600 dark:text-teal-400" size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-900 dark:text-teal-100 text-sm uppercase tracking-wide mb-1">Situation Insight</h4>
                    <p className="text-teal-800 dark:text-teal-200 text-sm leading-relaxed">{result.insight}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#12121a]/60 p-3 rounded-xl text-center border border-teal-100/50 dark:border-teal-950/30">
                  <p className="text-sm font-semibold text-teal-900 dark:text-teal-100">💡 Guidance: {result.guidance}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white ml-1">Suggested Replies</h3>
                {result.replies.map(reply => (
                  <ConflictReplyCard
                    key={reply.id}
                    reply={reply}
                    onSave={async (text) => {
                      try {
                        const updatedUser = await userService.saveReply(user.email, text, 'Conflict');
                        if (updatedUser) onUpdateUser(updatedUser);
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }}
                  />
                ))}
              </div>

              {/* Tips */}
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-5">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                  <Shield size={16} className="mr-2 text-slate-500 dark:text-gray-400" />
                  Practical Steps (Non-Text)
                </h4>
                <ul className="space-y-2">
                  {result.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-gray-300 flex items-start">
                      <span className="mr-2 text-teal-500">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 pb-8">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setStep(1)}
                  className="border-slate-300 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5"
                >
                  Start Over
                </Button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const OptionButton: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
  small?: boolean;
}> = ({ label, selected, onClick, small }) => (
  <button
    onClick={onClick}
    className={`
      ${small ? 'py-2 px-1 text-xs' : 'py-3 px-4 text-sm'} 
      rounded-xl border-2 font-medium transition-all text-center
      ${selected
        ? 'border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-950/20 text-teal-800 dark:text-teal-200 shadow-sm'
        : 'border-slate-100 dark:border-white/5 bg-white dark:bg-[#12121a] text-slate-600 dark:text-gray-300 hover:border-slate-200 dark:hover:border-white/10 dark:border-white/5'
      }
    `}
  >
    {label}
  </button>
);

const ConflictReplyCard: React.FC<{ reply: any, onSave: (text: string) => void }> = ({ reply, onSave }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reply.text);
    onSave(reply.text); // Save to profile when copied
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    switch (reply.type) {
      case 'Soft Repair': return <Heart size={16} className="text-rose-500" />;
      case 'Balanced Honest': return <MessageCircle size={16} className="text-blue-500" />;
      case 'Boundary + Care': return <Shield size={16} className="text-amber-500" />;
      default: return <Sparkles size={16} className="text-teal-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#12121a] rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        {getIcon()}
        <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{reply.type}</span>
      </div>

      <p className="text-sm font-medium text-slate-800 dark:text-gray-100 mb-2 font-sans leading-relaxed">"{reply.text}"</p>

      <div className="flex items-end justify-between border-t border-slate-50 dark:border-white/5 pt-3 mt-2">
        <p className="text-xs text-slate-400 dark:text-gray-500 italic pr-4 max-w-[75%]">{reply.whyItWorks}</p>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium shrink-0"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};

export default ConflictResolutionModal;
