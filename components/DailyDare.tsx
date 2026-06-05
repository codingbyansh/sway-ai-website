import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, AlertCircle, RefreshCw, Play, CheckCircle2, ChevronRight, Copy, Check, Instagram, Info, Award, Trophy, Share2 } from 'lucide-react';
import { verifyDailyDareCompletion } from '../services/geminiService';
import { User } from '../types';

interface DailyDareProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

interface Dare {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: number;
  tips: string[];
}

const DARES: Dare[] = [
  {
    id: 1,
    title: "Sincere Vibe Check",
    description: "Compliment someone on their choice of books, bio details, or music taste (not their physical looks!). Ask a curious follow-up question.",
    difficulty: "Easy",
    reward: 25,
    tips: ["Check their profile bios for hobbies, movies, or Spotify cards.", "Example: 'Wes Anderson fan? Tell me your favorite film of his!'"]
  },
  {
    id: 2,
    title: "Bollywood Hook Dare",
    description: "Send a dramatic or cheesy Bollywood-themed Hinglish opener to your match.",
    difficulty: "Medium",
    reward: 35,
    tips: ["Use playful, self-aware Hinglish.", "Example: 'If we were in a Bollywood film, I would have dropped my books. Since we are on Sync AI, I'll drop this text instead! 😉'"]
  },
  {
    id: 3,
    title: "Ghost Buster Reviver",
    description: "Send a dry conversation match a playful revival text referencing a funny meme or a wacky hypothetical question.",
    difficulty: "Hard",
    reward: 50,
    tips: ["Keep it extremely lighthearted and low-pressure.", "Example: 'Are you still alive or did you get lost in the Bermuda Triangle? 😂'"]
  },
  {
    id: 4,
    title: "Anti-Small Talk Hook",
    description: "Skip the standard 'hey, how are you' entirely. Ask them about their absolute dream job when they were 8 years old.",
    difficulty: "Medium",
    reward: 35,
    tips: ["Explicitly state that small talk is banned for 3 messages.", "Example: 'Let's ban small talk. What was your childhood dream job? I'll go first: astronaut astronaut astronaut'"]
  },
  {
    id: 5,
    title: "The Great Food Debate",
    description: "Engage your match in a fun debate on a controversial culinary combination (e.g. pineapple on pizza, warm milk vs cold, Maggi with ketchup).",
    difficulty: "Easy",
    reward: 25,
    tips: ["Act shocked by their response to add playfulness.", "Example: 'Critical vibe test: pineapple on pizza, yes or completely illegal?'"]
  },
  {
    id: 6,
    title: "Emoji Bio Description",
    description: "Describe your entire daily routine using only emojis, and dare your match to guess it.",
    difficulty: "Easy",
    reward: 25,
    tips: ["Use 5 to 6 emojis.", "Example: 'Rate my day: 😴☕💻🍕🎮🚗?'"]
  }
];

const DailyDare: React.FC<DailyDareProps> = ({ user, onUpdateUser }) => {
  const [currentDare, setCurrentDare] = useState<Dare>(DARES[0]);
  const [dareStatus, setDareStatus] = useState<'idle' | 'accepted' | 'completed'>('idle');
  const [proofText, setProofText] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);
  const [rizzScore, setRizzScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successConfetti, setSuccessConfetti] = useState(false);
  
  // Stats
  const [syncStreak, setSyncStreak] = useState<number>(0);
  const [totalCompleted, setTotalCompleted] = useState<number>(0);
  const [hasSwappedToday, setHasSwappedToday] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Load gamification states from localStorage
    const savedStreak = localStorage.getItem('sync_flare_streak');
    const savedCompleted = localStorage.getItem('sync_dares_completed_count');
    const savedDateStr = localStorage.getItem('sync_dare_last_completed_date');
    const savedDareId = localStorage.getItem('sync_dare_current_id');
    const savedStatus = localStorage.getItem('sync_dare_status');
    const savedSwappedDate = localStorage.getItem('sync_dare_swapped_date');

    const today = new Date().toDateString();

    if (savedStreak) setSyncStreak(parseInt(savedStreak));
    if (savedCompleted) setTotalCompleted(parseInt(savedCompleted));
    
    // Check if swapped today
    if (savedSwappedDate === today) {
      setHasSwappedToday(true);
    } else {
      setHasSwappedToday(false);
    }

    // Daily dare reset check
    if (savedDateStr && savedDateStr !== today) {
      // New day! Reset dare progress
      localStorage.setItem('sync_dare_status', 'idle');
      localStorage.removeItem('sync_dare_completed_score');
      localStorage.removeItem('sync_dare_completed_feedback');
      setDareStatus('idle');
      setRizzScore(null);
      setVerificationFeedback(null);

      // Pick a random dare for the new day
      const random = DARES[Math.floor(Math.random() * DARES.length)];
      setCurrentDare(random);
      localStorage.setItem('sync_dare_current_id', random.id.toString());
    } else {
      // Restore today's state
      if (savedStatus) {
        setDareStatus(savedStatus as any);
      }
      
      const savedScore = localStorage.getItem('sync_dare_completed_score');
      const savedFeedback = localStorage.getItem('sync_dare_completed_feedback');
      if (savedScore) setRizzScore(parseInt(savedScore));
      if (savedFeedback) setVerificationFeedback(savedFeedback);

      if (savedDareId) {
        const found = DARES.find(d => d.id === parseInt(savedDareId));
        if (found) setCurrentDare(found);
      }
    }

    // Check if streak was broken (e.g. more than 48 hours since last completed)
    if (savedDateStr) {
      const lastCompleted = new Date(savedDateStr);
      const diffTime = Math.abs(new Date().getTime() - lastCompleted.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 2) {
        setSyncStreak(0);
        localStorage.setItem('sync_flare_streak', '0');
      }
    }
  }, []);

  const handleAcceptDare = () => {
    setDareStatus('accepted');
    localStorage.setItem('sync_dare_status', 'accepted');
  };

  const handleSwapDare = () => {
    if (hasSwappedToday) return;

    // Pick a different dare
    const available = DARES.filter(d => d.id !== currentDare.id);
    const random = available[Math.floor(Math.random() * available.length)];
    
    setCurrentDare(random);
    setDareStatus('idle');
    setProofText('');
    setVerificationFeedback(null);
    setRizzScore(null);
    setHasSwappedToday(true);

    const today = new Date().toDateString();
    localStorage.setItem('sync_dare_current_id', random.id.toString());
    localStorage.setItem('sync_dare_status', 'idle');
    localStorage.setItem('sync_dare_swapped_date', today);
    localStorage.removeItem('sync_dare_completed_score');
    localStorage.removeItem('sync_dare_completed_feedback');
  };

  const handleVerifyDare = async () => {
    setError(null);
    if (proofText.trim().length < 10) {
      setError("Please write at least a few sentences (10+ characters) describing your completion or pasting the text reply.");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyDailyDareCompletion(currentDare.title, currentDare.description, proofText);
      
      if (result.completed) {
        setDareStatus('completed');
        setRizzScore(result.score);
        setVerificationFeedback(result.feedback);
        setSuccessConfetti(true);
        
        // Update gamified state
        const today = new Date().toDateString();
        localStorage.setItem('sync_dare_last_completed_date', today);
        localStorage.setItem('sync_dare_status', 'completed');
        localStorage.setItem('sync_dare_completed_score', result.score.toString());
        localStorage.setItem('sync_dare_completed_feedback', result.feedback);

        // Streak update logic
        const lastCompletedDate = localStorage.getItem('sync_dare_last_completed_date_prev');
        let newStreak = syncStreak;
        if (lastCompletedDate !== today) {
          newStreak = syncStreak + 1;
          setSyncStreak(newStreak);
          localStorage.setItem('sync_flare_streak', newStreak.toString());
          localStorage.setItem('sync_dare_last_completed_date_prev', today);
        }

        const newTotal = totalCompleted + 1;
        setTotalCompleted(newTotal);
        localStorage.setItem('sync_dares_completed_count', newTotal.toString());

        // Update Credits
        const bonus = currentDare.reward;
        const updatedCredits = user.credits + bonus;
        onUpdateUser({
          ...user,
          credits: updatedCredits
        });

        // Trigger confetti effect duration
        setTimeout(() => setSuccessConfetti(false), 5000);
      } else {
        setVerificationFeedback(result.feedback);
        setRizzScore(result.score);
        setError(result.feedback || "Your proof could not be verified. Please write a more detailed explanation of what you did.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to verify dare. Please check internet connection.");
    } finally {
      setIsVerifying(false);
    }
  };

  const copyShareLink = () => {
    const shareText = `I completed today's Sync AI Daily Dare! Build your dating confidence, unlock witty Hinglish replies, and test your Sync score at https://syncai.live! Follow @syncai.live on Instagram. 🔥`;
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(null as any), 3000);
  };

  const downloadShareCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 600);
    grad.addColorStop(0, '#12121e');
    grad.addColorStop(1, '#0c0c14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 600);

    // Light Glow
    ctx.beginPath();
    ctx.arc(300, 100, 150, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.06)';
    ctx.fill();

    // Border Rect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 360, 560);

    // Emblem
    const logoGrad = ctx.createLinearGradient(170, 60, 230, 120);
    logoGrad.addColorStop(0, '#f43f5e');
    logoGrad.addColorStop(1, '#a855f7');
    ctx.fillStyle = logoGrad;
    ctx.beginPath();
    ctx.arc(200, 90, 30, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 200, 90);

    // Text App Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('SYNC AI', 200, 150);

    // Subtitle
    ctx.fillStyle = '#f43f5e';
    ctx.font = '900 11px sans-serif';
    ctx.fillText('SYNC STATS CARD', 200, 180);

    // User Name
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(user.name || 'Sync User', 200, 225);

    // Stats Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(40, 260, 320, 160, 16) : ctx.rect(40, 260, 320, 160);
    ctx.fill();
    ctx.stroke();

    // Stats Drawing
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('SYNC FLARE STREAK:', 60, 300);
    
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${syncStreak} DAYS`, 240, 300);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('RANK LEVEL:', 60, 340);

    const currentRank = totalCompleted >= 13 ? "Master of Sync" :
                     totalCompleted >= 8 ? "Sync Virtuoso" :
                     totalCompleted >= 4 ? "Charming Signal" :
                     totalCompleted >= 1 ? "Vibe Syncer" : "Spark Syncer";

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(currentRank, 240, 340);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('COMPLETED DARES:', 60, 380);

    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${totalCompleted}`, 240, 380);

    // Footer Branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('VERIFY SCORE ON SYNCAI.LIVE', 200, 480);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Instagram: @syncai.live', 200, 520);

    // Trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${user.name || 'sync'}-stats-card.png`;
    link.href = dataUrl;
    link.click();
  };

  // Helper styles based on difficulty
  const getDiffBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="px-4 md:px-6 pt-4 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Dynamic Confetti Sparks */}
      {successConfetti && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
          {[...Array(25)].map((_, i) => {
            const randomX = Math.random() * 100;
            const randomDelay = Math.random() * 2;
            const colors = ['#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#a855f7'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            return (
              <motion.div
                key={i}
                initial={{ y: 200, x: `${randomX}%`, opacity: 1, scale: 0.8 }}
                animate={{ y: -400, opacity: 0, scale: 1.2 }}
                transition={{ duration: 2.5, delay: randomDelay, ease: "easeOut" }}
                className="absolute w-3 h-3 rounded-full"
                style={{ backgroundColor: randomColor, boxShadow: `0 0 10px ${randomColor}` }}
              />
            );
          })}
        </div>
      )}

      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1 bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 px-4 py-1.5 rounded-full border border-rose-500/20">
          <Flame size={16} className="animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest">Confidence Quests</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
          Interactive <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">Daily Dare</span>
        </h2>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
          Level up your relationship confidence with daily micro-challenges. Submit your proof and let Sync AI grade your Sync skills, unlocking credits!
        </p>
      </div>

      {/* Stats and Info Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#12121a] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-center flex flex-col justify-center items-center">
          <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 mb-1">
            <Flame size={20} className={syncStreak > 0 ? "animate-pulse fill-rose-500/20" : ""} />
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Sync Flare Streak</p>
          <p className="text-lg font-black text-gray-900 dark:text-white">{syncStreak} {syncStreak === 1 ? 'Day' : 'Days'}</p>
        </div>

        <div className="bg-white dark:bg-[#12121a] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-center flex flex-col justify-center items-center">
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500 mb-1">
            <Trophy size={20} />
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Quests Beaten</p>
          <p className="text-lg font-black text-gray-900 dark:text-white">{totalCompleted} Dares</p>
        </div>

        <div className="col-span-2 md:col-span-1 bg-white dark:bg-[#12121a] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-center flex flex-col justify-center items-center">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 mb-1">
            <Award size={20} />
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Sync Level</p>
          <p className="text-sm font-black text-gray-900 dark:text-white mt-1">
            {totalCompleted >= 13 ? "Master of Sync" :
             totalCompleted >= 8 ? "Sync Virtuoso" :
             totalCompleted >= 4 ? "Charming Signal" :
             totalCompleted >= 1 ? "Vibe Syncer" : "Spark Syncer"}
          </p>
        </div>
      </div>

      {/* Main Dare Sandbox Card */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#12121a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-md overflow-hidden transition-all duration-300">
        
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-widest font-black opacity-80">Challenge of the Day</span>
            <h3 className="text-lg md:text-xl font-black">{currentDare.title}</h3>
          </div>
          <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${getDiffBadge(currentDare.difficulty)}`}>
            {currentDare.difficulty}
          </span>
        </div>

        {/* Dare Description & Details */}
        <div className="p-6 space-y-6">
          <p className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
            {currentDare.description}
          </p>

          {/* Tips Section */}
          <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <Info size={14} className="text-rose-500" />
              <span>Sync AI Pro Tips</span>
            </div>
            <ul className="space-y-1.5 pl-1">
              {currentDare.tips.map((tip, idx) => (
                <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5 mr-2" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-100 dark:border-white/5 pt-6">
            <AnimatePresence mode="wait">
              {dareStatus === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col sm:flex-row items-center gap-4"
                >
                  <button
                    onClick={handleAcceptDare}
                    className="w-full sm:flex-1 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/15 hover:scale-[1.02] transition-transform active:scale-[0.98]"
                  >
                    <Play size={16} fill="white" />
                    <span>Accept Quest (+{currentDare.reward} Credits)</span>
                  </button>

                  <button
                    onClick={handleSwapDare}
                    disabled={hasSwappedToday}
                    className={`w-full sm:w-auto px-6 py-4 rounded-2xl border font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                      hasSwappedToday
                        ? 'bg-gray-100 dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/5 cursor-not-allowed'
                        : 'bg-white dark:bg-[#12121a] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/5 hover:border-rose-500/20 active:scale-[0.98]'
                    }`}
                    title="Swap challenge once per day"
                  >
                    <RefreshCw size={14} className={hasSwappedToday ? '' : 'animate-spin-slow'} />
                    <span>{hasSwappedToday ? 'Swapped Today' : 'Swap Dare'}</span>
                  </button>
                </motion.div>
              )}

              {dareStatus === 'accepted' && (
                <motion.div
                  key="accepted"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Paste screenshot text or explain what happened
                    </label>
                    <textarea
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      placeholder="Paste the message you sent, details of the reply you got, or describe what you did..."
                      rows={4}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-colors text-gray-900 dark:text-white"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center space-x-1.5 text-xs text-red-500 font-bold bg-red-50 dark:bg-red-500/10 p-2.5 rounded-xl border border-red-500/10">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleVerifyDare}
                      disabled={isVerifying}
                      className="w-full sm:flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/15 hover:scale-[1.02] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                    >
                      {isVerifying ? (
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Submit & Verify with Sync AI</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setDareStatus('idle')}
                      disabled={isVerifying}
                      className="w-full sm:w-auto px-6 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 rounded-2xl font-bold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {dareStatus === 'completed' && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 text-center py-4"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/20 shadow-md">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-gray-900 dark:text-white text-lg">Daily Dare Completed!</h4>
                    <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">
                      Sync AI Evaluation Score: {rizzScore !== null ? rizzScore : '--'}/100 Sync
                    </p>
                  </div>

                  {verificationFeedback && (
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 italic max-w-md mx-auto leading-relaxed border-l-4 border-emerald-500 pl-4 py-1 text-left bg-emerald-500/[0.02]">
                      "{verificationFeedback}"
                    </p>
                  )}

                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">
                    Come back tomorrow for your next confidence challenge!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Share Section Poster */}
      <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#12121e] to-[#0c0c14] border border-white/5 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden [perspective:1000px]">
        {/* Glow */}
        <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4">
            <h3 className="text-xl font-black bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
              Share the Sync AI Vibe
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Helping your friends upgrade their texts? Copy the official link `syncai.live` and tag us at our Instagram page to follow the ultimate Sync lessons.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={copyShareLink}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/10 flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
              >
                {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                <span>{isCopied ? 'Link Copied!' : 'Copy Invite Link'}</span>
              </button>

              <button
                onClick={downloadShareCard}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
              >
                <Share2 size={14} />
                <span>Download Share Card</span>
              </button>

              <a
                href="https://www.instagram.com/syncai.live"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
              >
                <Instagram size={14} />
                <span>Instagram @syncai.live</span>
              </a>
            </div>
          </div>

          {/* Interactive Poster Mockup */}
          <div className="md:col-span-5 flex justify-center [transform-style:preserve-3d] transition-transform duration-500 hover:rotate-y-[12deg] hover:rotate-x-[-6deg]">
            <div className="w-56 bg-gradient-to-b from-gray-900 to-[#161623] border border-white/15 p-4 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl" />
              <div className="w-10 h-10 bg-gradient-to-tr from-rose-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-black text-white shadow-md mb-2">
                S
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider text-rose-500">Sync Stats Card</p>
              <p className="text-xs font-black text-white mt-1">Confidence Quest Pro</p>
              
              <div className="w-full bg-white/5 border border-white/5 p-2 rounded-xl mt-3 space-y-1">
                <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold">
                  <span>FLARE STREAK:</span>
                  <span className="text-rose-500 flex items-center gap-0.5">
                    <Flame size={8} className="fill-rose-500" /> {syncStreak} DAYS
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold">
                  <span>LEVEL:</span>
                  <span className="text-white">
                    {totalCompleted >= 8 ? "Sync Pro" : "Syncer"}
                  </span>
                </div>
              </div>
              
              <p className="text-[9px] font-black tracking-tighter text-gray-500 mt-4 uppercase">
                verify score on syncai.live
              </p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default DailyDare;
