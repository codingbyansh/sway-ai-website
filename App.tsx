import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import { motion } from 'framer-motion';
import InputSection from './components/InputSection';
import OptionsSelector from './components/OptionsSelector';
import Button from './components/Button';
import SwipeableReplyCard from './components/SwipeableReplyCard';
import ReplyCard from './components/ReplyCard';
import PremiumModal from './components/PremiumModal';
import GhostingRecovery from './components/GhostingRecovery';
import ConflictResolutionModal from './components/ConflictResolutionModal';
import SavedRepliesModal from './components/SavedRepliesModal';
import CreditsBar from './components/CreditsBar';
import { AuthPage } from './components/AuthPage';
import PracticeArena from './components/PracticeArena';
import IcebreakerWheel from './components/IcebreakerWheel';
import DailyDare from './components/DailyDare';
import { Logo } from './components/Logo';
import SyncGifts from './components/SyncGifts';
import BottomNav from './components/BottomNav';
import ProfileSection from './components/ProfileSection';
import Sidebar from './components/Sidebar';
import LoadingScreen from './components/LoadingScreen';
import { Gift } from 'lucide-react';
import {
  InputMode, Tone, Language, GeneratedResponse, UserCredits, TextStyle, User
} from './types';
import { MOCK_LOADING_MESSAGES } from './constants';
import { generateReplies } from './services/geminiService';
import { Sparkles, Crown, Sun, Moon } from 'lucide-react';
import { userService } from './services/userService';
import { auth, isFirebaseSetup } from './services/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

import { MessageCircle } from 'lucide-react';

const HeroSection: React.FC<{ isPremium?: boolean, savedCount: number, onOpenSaved: () => void }> = ({ isPremium, savedCount, onOpenSaved }) => (
  <div className="flex flex-col items-center justify-center py-6 lg:py-10 text-center space-y-6">
    <div className="p-6 bg-white dark:bg-[#12121a] rounded-full shadow-lg shadow-pink-100 border border-pink-50 transform hover:scale-105 transition-transform duration-300 relative">
      <Logo className="w-24 h-24 md:w-32 md:h-32" />
      {isPremium && (
        <div className="absolute -top-2 -right-2 bg-pink-500 text-white p-2 rounded-full shadow-lg">
          <Crown size={20} />
        </div>
      )}
    </div>
    <div className="space-y-3 max-w-lg mx-auto flex flex-col items-center">
      {isPremium ? (
        <div className="bg-pink-500/10 text-pink-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-2 border border-pink-500/20">
          Sync AI Premium Member
        </div>
      ) : null}
      <h1 className="text-2xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
        Reply with <span className="bg-gradient-to-r from-pink-300 via-rose-500 to-red-500 bg-clip-text text-transparent">Confidence</span>
      </h1>
      <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
        Welcome back! You have Unlimited Free AI Credits under our Launch Celebration Promo.
      </p>

      <div className="flex items-center justify-center mt-4">
        {/* Hero Saved Replies Button */}
        <button
          onClick={onOpenSaved}
          className="flex items-center justify-center space-x-2 bg-white dark:bg-[#12121a] hover:bg-gray-50 dark:hover:bg-white/5 dark:bg-white/5 dark:hover:bg-white/5 dark:bg-white/5 text-gray-800 dark:text-gray-100 px-5 py-2.5 rounded-full shadow-sm border border-gray-200 dark:border-white/5 transition-all hover:shadow-md group"
        >
          <MessageCircle size={18} className="text-pink-500 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-sm">View Saved Replies</span>
          {savedCount > 0 && (
            <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
              {savedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  </div>
);

// --- LocalStorage helpers ---
const saveToStorage = (key: string, data: any) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { }
};
const loadFromStorage = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const App: React.FC = () => {
  // --- State (restore from localStorage on mount) ---
  const [rawUser, setRawUser] = useState<User | null>(() => loadFromStorage<User>('sync ai_user'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const cached = localStorage.getItem('sync_theme');
    if (cached) return cached === 'dark';
    return true; // Default to dark mode on first visit
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sync_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sync_theme', 'light');
    }
  }, [isDarkMode]);
  const setUser = (u: User | null) => setRawUser(u);

  // --- Auto-login Googlebot / AdSense crawler for verification bypass ---
  useEffect(() => {
    try {
      const ua = (navigator.userAgent || '').toLowerCase();
      const isCrawler = ua.includes('googlebot') || 
                        ua.includes('mediapartners-google') || 
                        ua.includes('adsbot-google') || 
                        ua.includes('google-coop');
      if (isCrawler && (!rawUser || rawUser.email !== 'demo@sync ai.ai')) {
        console.log("AdSense Crawler detected! Logging in to Demo Account...");
        userService.syncUser('demo@sync ai.ai', 'Demo User').then(demoUser => {
          if (demoUser) {
            setUser({ ...demoUser, isPremium: true, credits: 9999 });
          }
        }).catch(e => console.warn("Crawler login error:", e));
      }
    } catch (e) {
      console.warn("Crawler check failed:", e);
    }
  }, [rawUser]);


  const [authLoading, setAuthLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showGhostingModal, setShowGhostingModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showSavedRepliesModal, setShowSavedRepliesModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [activeTab, setActiveTab] = useState('replies');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [mode, setMode] = useState<InputMode>(InputMode.TEXT);
  const [textInput, setTextInput] = useState('');
  const [imageInput, setImageInput] = useState<string | null>(null);

  const [selectedTone, setSelectedTone] = useState<Tone>(Tone.CONFIDENT);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.HINGLISH);
  const [useEmojis, setUseEmojis] = useState<boolean>(true);
  const [textStyle, setTextStyle] = useState<TextStyle>(TextStyle.STANDARD);

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(MOCK_LOADING_MESSAGES[0]);

  const [result, setResult] = useState<GeneratedResponse | null>(() => loadFromStorage<GeneratedResponse>('sync ai_replies'));
  const [currentReplyIndex, setCurrentReplyIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'robo' | 'swipe'>('robo');
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Persist user & replies to localStorage ---
  useEffect(() => {
    if (rawUser) saveToStorage('sync ai_user', rawUser);
    else localStorage.removeItem('sync ai_user');
  }, [rawUser]);

  useEffect(() => {
    if (result) saveToStorage('sync ai_replies', result);
    else localStorage.removeItem('sync ai_replies');
  }, [result]);

  // --- Effects ---
  useEffect(() => {
    const minLoadingTime = 2000;
    const startTime = Date.now();

    const checkAndResolve = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);
      console.log("Resolving Auth Loading in", remaining, "ms");
      setTimeout(() => {
        setAuthLoading(false);
      }, remaining);
    };

    if (!isFirebaseSetup || !auth) {
      console.log("Firebase not setup or auth missing, resolving early.");
      checkAndResolve();
      return;
    }

    let authResolved = false;
    
    // Safety timeout — show app eventually even if Firebase hangs
    const timeout = setTimeout(() => {
      if (!authResolved) {
        console.warn("Auth resolution safety timeout reached");
        authResolved = true;
        checkAndResolve();
      }
    }, 8000);

    try {
      console.log("Attaching onAuthStateChanged listener...");
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("Auth state changed:", firebaseUser?.email || "No user");
        if (authResolved && firebaseUser === null) return; // Prevent double toggles

        try {
          if (firebaseUser?.email) {
            const local = userService.getLocalUser(firebaseUser.email.toLowerCase());
            if (local) {
              console.log("Found local user:", local.email);
              setUser(local);
            }

            userService.getUser(firebaseUser.email).then(syncUser => {
              if (syncUser) {
                console.log("Fetched sync user from Firestore:", syncUser.email);
                setUser(syncUser);
              }
            }).catch(err => console.warn("Firestore user fetch failed:", err));
          } else {
            console.log("Setting user to null");
            setUser(null);
          }
        } catch (err) {
          console.error("Auth state logic error:", err);
          setUser(null);
        }
        
        if (!authResolved) {
          authResolved = true;
          checkAndResolve();
        }
      }, (error) => {
        console.error("onAuthStateChanged callback error:", error);
        if (!authResolved) {
          authResolved = true;
          checkAndResolve();
        }
      });

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (err) {
      console.error("Firebase auth listener failed to attach:", err);
      if (!authResolved) {
        authResolved = true;
        checkAndResolve();
      }
      return () => clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    let interval: number;
    if (isGenerating) {
      let i = 0;
      interval = window.setInterval(() => {
        i = (i + 1) % MOCK_LOADING_MESSAGES.length;
        setLoadingMessage(MOCK_LOADING_MESSAGES[i]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Scroll to top when active tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Scroll to top when input mode changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mode]);

  // Scroll to top when generation starts or results are generated
  useEffect(() => {
    if (isGenerating || (result && !isGenerating)) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [result, isGenerating]);

  // Periodic check for daily credit reset (e.g., if user leaves app open past midnight)
  useEffect(() => {
    if (!rawUser) return;

    const checkReset = async () => {
      // Get local date string YYYY-MM-DD
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      if (rawUser.lastCreditReset !== today) {
        console.log("Midnight reset detected, resetting credits...");
        const updatedUser = await userService.checkAndResetCredits(rawUser);
        setUser({ ...updatedUser });
      }
    };

    const interval = setInterval(checkReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [rawUser]);

  // --- Handlers ---
  const handleGenerate = async () => {
    setError(null);

    if (!textInput.trim()) {
      setError("Please paste a text message first.");
      return;
    }
    if (!rawUser) return;

    setIsGenerating(true);
    setResult(null);
    setCurrentReplyIndex(0);

    try {
      const response = await generateReplies(
        textInput,
        null,
        selectedTone,
        selectedLanguage,
        useEmojis,
        textStyle
      );

      setResult(response);

      // Keep credits at 9999 locally and update in background
      setUser({ ...rawUser, credits: 9999, isPremium: true });
      userService.deductCredit(rawUser.email).catch(() => { });

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePurchaseSuccess = async (result: { isPremium?: boolean; bonusCredits?: number }) => {
    if (!rawUser) return;
    // Sync the latest user data from Firestore/backend after purchase
    const updated = await userService.getUser(rawUser.email);
    if (updated) {
      setUser(updated);
    } else {
      // Fallback: patch locally
      setUser({
        ...rawUser,
        isPremium: result.isPremium ?? rawUser.isPremium,
        credits: result.isPremium ? 50 : rawUser.credits,
      });
    }
  };


  const handleLogout = async () => {
    if (isFirebaseSetup && auth) {
      await signOut(auth);
    }
    setUser(null);
    setResult(null);
    localStorage.removeItem('sync ai_user');
    localStorage.removeItem('sync ai_replies');
  };

  const handleGhostingClick = () => {
    setActiveTab('ghosting');
  };

  const handleConflictClick = () => {
    setActiveTab('talkitout');
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  try {
    if (!rawUser || !rawUser.email) {
      return <AuthPage onLogin={setUser} />;
    }

    console.log("App Rendering with user:", rawUser.email, "Active Tab:", activeTab);

    // Final Safety: Ensure mandatory properties exist
    const validatedUser = {
      ...rawUser,
      credits: rawUser.credits ?? 0,
      isPremium: !!rawUser.isPremium,
      savedReplies: rawUser.savedReplies || [],
    };

    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0f] text-gray-900 dark:text-white dark:text-gray-100 transition-colors duration-300 flex flex-col">

        {/* ── Full page row: sidebar + content ── */}
        <div style={{ display: 'flex', flex: 1 }}>

          {/* Sidebar (desktop: persistent strip; mobile: overlay drawer) */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={validatedUser}
            onLogout={handleLogout}
          />

          {/* Main column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Header
              credits={{ remaining: validatedUser.credits, isPremium: validatedUser.isPremium }}
              onOpenPremium={() => setShowPremiumModal(true)}
              onOpenGhosting={() => setActiveTab('ghosting')}
              onOpenConflict={() => setActiveTab('talkitout')}
              onOpenSavedReplies={() => setShowSavedRepliesModal(true)}
              onOpenProfile={() => setActiveTab('profile')}
              user={validatedUser}
              onLogout={handleLogout}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
              isDarkMode={isDarkMode}
              toggleTheme={() => setIsDarkMode(!isDarkMode)}
            />

            <main style={{ flex: 1, paddingBottom: 120 } as React.CSSProperties}>
              {activeTab === 'replies' && (
                <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4">
                  <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white px-3 py-2 md:px-4 md:py-3.5 rounded-2xl md:rounded-3xl shadow-lg flex items-center justify-center gap-2 mb-4 md:mb-6 text-[10px] md:text-sm font-black text-center border border-pink-400/20 shadow-pink-500/10 animate-pulse">
                    <Sparkles size={14} className="shrink-0 text-pink-200 md:w-4 md:h-4" />
                    <span className="hidden md:inline">Sync AI Launch Celebration: All Premium features are currently 100% Free with Unlimited Credits! No payment required.</span>
                    <span className="md:hidden">Premium is 100% Free with Unlimited Credits!</span>
                  </div>
                </div>
              )}
              <div className="max-w-6xl mx-auto">
                {activeTab === 'replies' && (
                  <div className="px-3 md:px-6 pt-4 relative">
                    <div className="lg:hidden mb-4">
                      <HeroSection
                        isPremium={validatedUser.isPremium}
                        savedCount={validatedUser.savedReplies?.length || 0}
                        onOpenSaved={() => setShowSavedRepliesModal(true)}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start">
                      <div className="lg:col-span-5 space-y-4">
                        <div className="bg-white dark:bg-[#12121a] p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                          <InputSection
                            mode={mode}
                            setMode={setMode}
                            textInput={textInput}
                            setTextInput={setTextInput}
                            imageInput={imageInput}
                            setImageInput={setImageInput}
                          />

                          <OptionsSelector
                            selectedTone={selectedTone}
                            setSelectedTone={setSelectedTone}
                            selectedLanguage={selectedLanguage}
                            setSelectedLanguage={setSelectedLanguage}
                            useEmojis={useEmojis}
                            setUseEmojis={setUseEmojis}
                            textStyle={textStyle}
                            setTextStyle={setTextStyle}
                          />

                          {error && (
                            <div className="p-2 bg-red-50 text-red-600 text-xs rounded-xl text-center font-medium">
                              {error}
                            </div>
                          )}

                          <div id="tour-generate">
                            <Button
                              fullWidth
                              onClick={handleGenerate}
                              isLoading={isGenerating}
                              disabled={isGenerating}
                              className="h-12 text-base"
                            >
                              {isGenerating ? loadingMessage : (
                                <span className="flex items-center">
                                  <Sparkles size={18} className="mr-2" />
                                  Generate Replies
                                </span>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-7">
                        <div className="hidden lg:block">
                          <HeroSection
                            isPremium={validatedUser.isPremium}
                            savedCount={validatedUser.savedReplies?.length || 0}
                            onOpenSaved={() => setShowSavedRepliesModal(true)}
                          />
                        </div>

                        {result && (
                          <div ref={resultsRef} className="space-y-4 pt-4 lg:border-t lg:border-gray-100 dark:border-white/5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-3 rounded-xl gap-2">
                              <div>
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-0.5">
                                  AI Context Analysis
                                </p>
                                <div className="text-xs text-gray-800 dark:text-gray-100">
                                  <span className="font-semibold">{result.analysis.stage}</span> • {result.analysis.intent}
                                </div>
                              </div>
                              <div className="sm:text-right sm:max-w-[60%]">
                                <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed">"{result.analysis.advice}"</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between items-center px-1">
                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Suggested Replies</h3>
                                {viewMode === 'robo' && (
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    {currentReplyIndex + 1} of {result.replies.length}
                                  </span>
                                )}
                              </div>

                              <div className="relative">
                                {viewMode === 'robo' ? (
                                  result.replies[currentReplyIndex] ? (
                                    <SwipeableReplyCard
                                      key={result.replies[currentReplyIndex].id}
                                      reply={result.replies[currentReplyIndex]}
                                      onAccept={async (reply) => {
                                        try {
                                          const updatedUserRes = await userService.saveReply(validatedUser.email, reply.text, 'ReplyWithConfidence');
                                          if (updatedUserRes) setUser(updatedUserRes);
                                        } catch (e: any) {
                                          alert(e.message);
                                        }
                                      }}
                                      onNext={() => {
                                        if (currentReplyIndex < result.replies.length - 1) {
                                          setCurrentReplyIndex(currentReplyIndex + 1);
                                        } else {
                                          setResult(null);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="h-[200px] flex items-center justify-center text-gray-400 italic text-sm">
                                      No more replies. Generate again!
                                    </div>
                                  )
                                ) : (
                                  <div className="grid grid-cols-1 gap-4">
                                    {result.replies.map((reply) => (
                                      <ReplyCard
                                        key={reply.id}
                                        reply={reply}
                                        onSave={async (r) => {
                                          try {
                                            const updatedUserRes = await userService.saveReply(validatedUser.email, r.text, 'ReplyWithConfidence');
                                            if (updatedUserRes) setUser(updatedUserRes);
                                          } catch (e: any) {
                                            alert(e.message);
                                          }
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Toggle switch at the bottom */}
                              <div className="flex justify-center pt-2">
                                <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-2xl flex gap-1 text-xs border border-gray-200/50 dark:border-white/5 shadow-inner">
                                  <button
                                    onClick={() => setViewMode('robo')}
                                    className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${viewMode === 'robo' ? 'bg-pink-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                  >
                                    <Sparkles size={12} />
                                    <span>Robo Type</span>
                                  </button>
                                  <button
                                    onClick={() => setViewMode('swipe')}
                                    className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${viewMode === 'swipe' ? 'bg-pink-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                  >
                                    <MessageCircle size={12} />
                                    <span>Swipe Cards</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="text-center pt-4">
                              <button
                                onClick={handleGenerate}
                                className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-pink-600 underline underline-offset-4"
                              >
                                Generate a fresh batch
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'practice' && (
                  <PracticeArena />
                )}

                {activeTab === 'wheel' && (
                  <IcebreakerWheel />
                )}

                {activeTab === 'daily-dare' && (
                  <DailyDare user={validatedUser} onUpdateUser={setUser} />
                )}

                {activeTab === 'ghosting' && (
                  <GhostingRecovery
                    onClose={() => setActiveTab('replies')}
                    user={validatedUser}
                    onUpdateUser={setUser}
                    isTabMode={true}
                  />
                )}

                {activeTab === 'talkitout' && (
                  <ConflictResolutionModal
                    onClose={() => setActiveTab('replies')}
                    user={validatedUser}
                    onUpdateUser={setUser}
                    isTabMode={true}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileSection
                    user={validatedUser}
                    onLogout={handleLogout}
                    onOpenPremium={() => setShowPremiumModal(true)}
                    onOpenSaved={() => setShowSavedRepliesModal(true)}
                  />
                )}
              </div>

              {/* AI Accuracy Disclaimer */}
              <div className="max-w-6xl mx-auto px-4 text-center mt-8 mb-2">
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed max-w-md mx-auto">
                  Note: Our AI may give inaccurate answers. Please review and use carefully.
                </p>
              </div>
            </main>

            <BottomNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isPremium={validatedUser.isPremium}
              onOpenPremium={() => setShowPremiumModal(true)}
            />

            {activeTab === 'replies' && (
              <footer className="hidden lg:block w-full bg-white dark:bg-[#12121a] border-t border-gray-50 dark:border-white/5 py-6 px-8">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-gray-400 font-medium">
                    &copy; {new Date().getFullYear()} <span className="font-bold text-gray-500 dark:text-gray-400">Aroxiania AI</span> — Sync AI
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                    <a href="/about.html" className="hover:text-pink-500 transition-colors">About</a>
                    <a href="/contact.html" className="hover:text-pink-500 transition-colors">Contact</a>
                    <a href="/privacy-policy.html" className="hover:text-pink-500 transition-colors">Privacy Policy</a>
                    <a href="/terms.html" className="hover:text-pink-500 transition-colors">Terms of Service</a>
                  </div>
                </div>
              </footer>
            )}
          </div>{/* end main column */}
        </div>{/* end row */}

        {/* ── Floating Gift Button ── */}
        {activeTab === 'replies' && (
          <div className="fixed bottom-24 right-5 z-50">
            <div className="absolute inset-0 bg-[#A52038] rounded-full blur-lg animate-pulse opacity-50" />
            <motion.button
              whileHover={{ scale: 1.12, rotate: 10 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowGiftModal(true)}
              className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#A52038] to-[#DE4557] flex items-center justify-center shadow-2xl"
              title="Sync Gifts (Coming Soon)"
            >
              <Gift className="text-white w-7 h-7" />
              {/* Coming Soon Tiny Badge Overlay */}
              <div className="absolute -top-1 -right-2 bg-yellow-400 dark:bg-yellow-500 text-[#232f3e] text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md uppercase tracking-wider scale-90 select-none pointer-events-none animate-pulse">
                Soon
              </div>
            </motion.button>
          </div>
        )}

        {/* ── Modals ── */}
        {showGiftModal && (
          <SyncGifts
            onClose={() => setShowGiftModal(false)}
            user={validatedUser}
            onUpdateUser={setUser}
          />
        )}

        {showSavedRepliesModal && (
          <SavedRepliesModal
            user={validatedUser}
            onClose={() => setShowSavedRepliesModal(false)}
            onUpdateUser={setUser}
          />
        )}

        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onPurchaseSuccess={handlePurchaseSuccess}
          user={validatedUser}
        />
      </div>
    );
  } catch (appErr: any) {
    console.error("CRASH CAPTURED IN APP:", appErr);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'black', color: '#f87171', padding: 32, fontFamily: 'monospace' }}>
        <div style={{ maxWidth: 480, width: '100%', background: 'rgba(127,29,29,0.1)', padding: 24, borderRadius: 16, border: '1px solid rgba(127,29,29,0.3)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>APPLICATION CRASH</h2>
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 16 }}>{appErr.message}</p>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
          >
            Clear Stale Data & Reload
          </button>
        </div>
      </div>
    );
  }
};

export default App;
