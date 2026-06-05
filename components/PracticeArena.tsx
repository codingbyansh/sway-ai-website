import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Send, RefreshCw, Sparkles, TrendingUp, AlertCircle, ThumbsUp, ChevronRight, User, Flame, MessageSquare, Instagram } from 'lucide-react';
import { analyzePracticeReply, PracticeAnalysisResponse } from '../services/geminiService';

interface Persona {
  id: string;
  name: string;
  age: number;
  role: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE';
  difficultyEmoji: string;
  avatarColor: string;
  description: string;
  startingMessage: string;
  language: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'over_flirty',
    name: 'Kabir',
    age: 23,
    role: 'Musician & Romantic',
    difficulty: 'EASY',
    difficultyEmoji: '🧸',
    avatarColor: 'from-pink-400 to-rose-500',
    description: 'Extremely flirty, cheesy, and loves romantic banter. Very encouraging!',
    startingMessage: 'Are you free this weekend or do I have to wait another lifetime? 😉',
    language: 'Hinglish & English'
  },
  {
    id: 'bollywood_buff',
    name: 'Riya',
    age: 22,
    role: 'Drama Queen & Filmy Buff',
    difficulty: 'MEDIUM',
    difficultyEmoji: '🍿',
    avatarColor: 'from-fuchsia-400 to-pink-600',
    description: 'Bollywood obsessive. Speaks in high-energy dramatic Hinglish, loves iconic dialogue banter.',
    startingMessage: 'Arre! Tumne abhi tak mujhe message nahi kiya? I was literally waiting like Simran at the platform! 🚂 Movie preferences share karo jaldi!',
    language: 'Hinglish & Hindi'
  },
  {
    id: 'busy_pro',
    name: 'Aanya',
    age: 26,
    role: 'Management Consultant',
    difficulty: 'MEDIUM',
    difficultyEmoji: '👔',
    avatarColor: 'from-blue-400 to-cyan-500',
    description: 'Polite, career-focused, and values intelligent, thoughtful conversations.',
    startingMessage: 'Hi! Apologies for the late response, got stuck in a client workshop. How is your week going?',
    language: 'English'
  },
  {
    id: 'techie_meme',
    name: 'Arjun',
    age: 25,
    role: 'Techie & Meme Fanatic',
    difficulty: 'EASY',
    difficultyEmoji: '💻',
    avatarColor: 'from-emerald-400 to-teal-600',
    description: 'Casual Bangalore developer. Bounces funny tech analogies and friendly Hinglish chat.',
    startingMessage: 'Hey! Just finished debugging code, but honestly, debugging your thoughts seems like a better Sunday plan. 😉 Shift-Enter or Chai?',
    language: 'Hinglish & English'
  },
  {
    id: 'dry_texter',
    name: 'Sneha',
    age: 21,
    role: 'Design Student',
    difficulty: 'HARD',
    difficultyEmoji: '🏜️',
    avatarColor: 'from-amber-400 to-orange-500',
    description: 'Minimalist Gen Z dry-texter. Speaks in lowercase, short sentences. Hard to impress!',
    startingMessage: 'hey',
    language: 'Hinglish'
  },
  {
    id: 'high_standards',
    name: 'Ishaan',
    age: 24,
    role: 'Sarcastic Banter Pro',
    difficulty: 'INSANE',
    difficultyEmoji: '🔥',
    avatarColor: 'from-purple-400 to-indigo-600',
    description: 'Sharp, highly sarcastic, and loves a challenge. Expect heavy teases!',
    startingMessage: "I'll bet you ₹100 you can't tell me something that actually surprises me.",
    language: 'Hinglish & English'
  }
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  analysis?: PracticeAnalysisResponse;
}

const PracticeArena: React.FC = () => {
  // Load initial states from localStorage
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(() => {
    try {
      const raw = localStorage.getItem('sync_practice_selected_persona_id');
      if (raw) {
        return PERSONAS.find(p => p.id === raw) || null;
      }
    } catch (e) {}
    return null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<PracticeAnalysisResponse | null>(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);

  // Instagram Share State variables
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Sync messages & latestAnalysis whenever selectedPersona changes
  useEffect(() => {
    if (!selectedPersona) {
      setMessages([]);
      setLatestAnalysis(null);
      return;
    }

    try {
      const rawChats = localStorage.getItem('sync_practice_chats');
      if (rawChats) {
        const parsed = JSON.parse(rawChats);
        const personaData = parsed[selectedPersona.id];
        if (personaData && personaData.messages && personaData.messages.length > 0) {
          setMessages(personaData.messages);
          setLatestAnalysis(personaData.latestAnalysis || null);
          return;
        }
      }
    } catch (e) {}

    // Fallback: Initialize with starting message if no saved convo
    setMessages([
      {
        id: 'starting',
        role: 'assistant',
        text: selectedPersona.startingMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setLatestAnalysis(null);
  }, [selectedPersona]);

  // Persist messages & latestAnalysis to localStorage whenever they change
  useEffect(() => {
    if (!selectedPersona || messages.length === 0) return;
    try {
      const rawChats = localStorage.getItem('sync_practice_chats');
      const parsed = rawChats ? JSON.parse(rawChats) : {};
      parsed[selectedPersona.id] = {
        messages,
        latestAnalysis
      };
      localStorage.setItem('sync_practice_chats', JSON.stringify(parsed));
    } catch (e) {}
  }, [messages, latestAnalysis, selectedPersona]);

  // Persist selectedPersonaId
  useEffect(() => {
    try {
      if (selectedPersona) {
        localStorage.setItem('sync_practice_selected_persona_id', selectedPersona.id);
      } else {
        localStorage.removeItem('sync_practice_selected_persona_id');
      }
    } catch (e) {}
  }, [selectedPersona]);

  // Helper to generate dynamic story card
  const generateStoryCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, '#0c0c14');
    bgGrad.addColorStop(0.5, '#12121a');
    bgGrad.addColorStop(1, '#1e0b24');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Soft glowing decorative circles
    ctx.beginPath();
    const radialGrad1 = ctx.createRadialGradient(200, 400, 50, 200, 400, 400);
    radialGrad1.addColorStop(0, 'rgba(236, 72, 153, 0.15)');
    radialGrad1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radialGrad1;
    ctx.arc(200, 400, 400, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    const radialGrad2 = ctx.createRadialGradient(900, 1500, 50, 900, 1500, 500);
    radialGrad2.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
    radialGrad2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radialGrad2;
    ctx.arc(900, 1500, 500, 0, Math.PI * 2);
    ctx.fill();

    // Glassmorphic main container card
    const cardX = 90;
    const cardY = 300;
    const cardWidth = 900;
    const cardHeight = 1320;
    const radius = 60;
    
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 20;

    // Draw rounded card background
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, radius);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fill();

    // Draw border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Draw Header Branding
    ctx.font = 'bold 54px Outfit, Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('SYNC AI', 540, 200);

    ctx.font = 'bold 24px Outfit, Inter, sans-serif';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('TEXTING CHAMPION', 540, 245);

    // Inside card: title
    ctx.font = 'bold 36px Outfit, Inter, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('PRACTICE ARENA MATCH', 540, cardY + 100);

    // Persona Details
    ctx.font = '800 64px Outfit, Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${selectedPersona?.name || 'Kabir'}, ${selectedPersona?.age || 23}`, 540, cardY + 200);

    ctx.font = '500 32px Outfit, Inter, sans-serif';
    ctx.fillStyle = '#e4e4e7';
    ctx.fillText(`Difficulty: ${selectedPersona?.difficulty || 'EASY'}`, 540, cardY + 260);

    // Draw concentric progress dial for Sync score
    const score = latestAnalysis?.rizzScore || 85;
    const rating = latestAnalysis?.rizzRating || 'Spicy';
    
    const dialX = 540;
    const dialY = cardY + 560;
    const dialRadius = 180;

    // Track circle
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 24;
    ctx.stroke();

    // Progress arc
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score) / 100);
    const ringGrad = ctx.createLinearGradient(dialX - dialRadius, dialY, dialX + dialRadius, dialY);
    ringGrad.addColorStop(0, '#ec4899');
    ringGrad.addColorStop(0.5, '#f43f5e');
    ringGrad.addColorStop(1, '#8b5cf6');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Score text inside ring
    ctx.font = 'bold 110px Outfit, Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${score}%`, dialX, dialY + 25);

    ctx.font = '900 24px Outfit, Inter, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('SYNC LEVEL', dialX, dialY + 75);

    // Rating Badge Container
    const badgeText = `${rating === 'Spicy' ? '🔥 Spicy' : 
                       rating === 'Sweet' ? '🧸 Sweet' : 
                       rating === 'Safe' ? '🛡️ Safe' : 
                       rating === 'Dry' ? '🏜️ Dry' : '❄️ Awkward'}`;
    
    ctx.font = 'bold 36px Outfit, Inter, sans-serif';
    const badgeWidth = ctx.measureText(badgeText).width + 60;
    const badgeHeight = 70;
    const badgeX = 540 - badgeWidth / 2;
    const badgeY = dialY + 160;

    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 35);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 32px Outfit, Inter, sans-serif';
    ctx.fillText(badgeText, 540, badgeY + 46);

    // Feedback Text Box
    const feedback = latestAnalysis?.feedback || "Great sync skills!";
    ctx.font = 'italic 28px Outfit, Inter, sans-serif';
    ctx.fillStyle = '#d4d4d8';
    
    // Wrap feedback text
    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
    };
    
    wrapText(`"${feedback}"`, 540, cardY + 920, 760, 42);

    // Footer Branding Inside Card
    ctx.font = 'bold 30px Outfit, Inter, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('syncai.live', 540, cardY + 1150);

    ctx.font = 'bold 36px Outfit, Inter, sans-serif';
    ctx.fillStyle = '#ec4899';
    ctx.fillText('@syncai.live', 540, cardY + 1210);

    // Return base64 URL
    return canvas.toDataURL('image/png');
  };

  const handleShareClick = () => {
    const imageUrl = generateStoryCard();
    setShareImageUrl(imageUrl);
    setShowShareModal(true);
    setIsCopied(false);
  };

  const captionText = `Just hit a ${latestAnalysis?.rizzScore}% Sync Level with ${selectedPersona?.name} on Sync AI! 💬 Can you beat my Sync score? Try now at syncai.live @syncai.live`;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleDownloadCard = () => {
    if (!shareImageUrl) return;
    const link = document.createElement('a');
    link.download = `sync-score-${selectedPersona?.name || 'match'}.png`;
    link.href = shareImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInstagram = () => {
    window.open('https://instagram.com/', '_blank');
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when the persona is changed, isTyping becomes false (AI reply shown), or a message is added
  useEffect(() => {
    if (selectedPersona && !isTyping) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedPersona, isTyping, messages.length]);

  // Auto-scroll to bottom of chat (internal container scroll only, avoiding window scroll jump)
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    };

    // Scroll immediately
    scrollToBottom();

    // Double-scroll after DOM paint delay to capture bubble expansion height
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const selectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setShowAnalysisPanel(false);
  };

  const resetConversation = (persona: Persona) => {
    try {
      const rawChats = localStorage.getItem('sync_practice_chats');
      const parsed = rawChats ? JSON.parse(rawChats) : {};
      delete parsed[persona.id];
      localStorage.setItem('sync_practice_chats', JSON.stringify(parsed));
    } catch (e) {}

    setMessages([
      {
        id: 'starting',
        role: 'assistant',
        text: persona.startingMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setLatestAnalysis(null);
    setShowAnalysisPanel(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPersona) return;

    const userMsgText = inputText.trim();
    setInputText('');

    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);
    setShowAnalysisPanel(false);

    try {
      const chatHistory = messages.map((m) => ({ role: m.role, text: m.text }));
      const evaluation = await analyzePracticeReply(selectedPersona.id, chatHistory, userMsgText);

      setIsTyping(false);
      setLatestAnalysis(evaluation);
      setShowAnalysisPanel(true);

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        text: evaluation.personaReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysis: evaluation
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setIsTyping(false);
    }
  };

  const getRatingBadgeClass = (rating: string) => {
    switch (rating) {
      case 'Spicy': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'Sweet': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'Safe': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Dry': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Awkward': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getDifficultyClass = (diff: string) => {
    switch (diff) {
      case 'EASY': return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
      case 'HARD': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
      case 'INSANE': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 animate-pulse';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="px-3 md:px-6 pt-4 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      {!selectedPersona && (
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-500/20">
            <Swords size={14} className="animate-bounce" />
            <span>AI Practice Arena</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            Level Up Your <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-red-500 bg-clip-text text-transparent">Texting Game</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Practice conversing with custom AI dating personas. Send your best texts, get instant **Sync Scores**, and receive professional coaching on each message!
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!selectedPersona ? (
          // PERSONA SELECTOR GRID
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4"
          >
            {PERSONAS.map((persona) => (
              <motion.div
                key={persona.id}
                whileHover={{ y: -5, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => selectPersona(persona)}
                className="bg-white dark:bg-[#12121a] hover:bg-gray-50/50 dark:hover:bg-[#14141e] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  {/* Persona Header */}
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${persona.avatarColor} flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-pink-500/5`}>
                      {persona.name[0]}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{persona.name}, {persona.age}</span>
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500">({persona.role})</span>
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getDifficultyClass(persona.difficulty)}`}>
                          {persona.difficultyEmoji} {persona.difficulty}
                        </span>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-500/10 dark:border-purple-500/5">
                          🌐 {persona.language}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Description */}
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {persona.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/5">
                  <span className="text-[10px] text-gray-400 font-medium">Click to practice conversation</span>
                  <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 group-hover:text-pink-500 transition-all" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // CHAT INTERFACE WITH RIZZ ANALYZER COLUMN
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            {/* Chat column */}
            <div className={`flex flex-col bg-white dark:bg-[#12121a] border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm h-[520px] lg:h-[580px] ${
              latestAnalysis ? 'lg:col-span-7' : 'lg:col-span-12'
            } transition-all duration-300`}>
              
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedPersona.avatarColor} flex items-center justify-center text-white text-base font-bold shadow-md shadow-pink-500/5`}>
                    {selectedPersona.name[0]}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>{selectedPersona.name}</span>
                      <span className="text-xs font-bold text-gray-400">({selectedPersona.age})</span>
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span>Simulating Practice Mode</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Change Persona button */}
                  <button
                    onClick={() => setSelectedPersona(null)}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-350 hover:text-pink-500 dark:hover:text-pink-400 rounded-xl transition-all flex items-center space-x-1.5 font-bold text-xs"
                    title="Change Persona"
                  >
                    <User size={14} />
                    <span className="hidden sm:inline">Change Persona</span>
                  </button>

                  {/* Reset button */}
                  <button
                    onClick={() => resetConversation(selectedPersona)}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-350 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl transition-all flex items-center space-x-1.5 font-bold text-xs"
                    title="Reset conversation"
                  >
                    <RefreshCw size={14} />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>
              </div>

              {/* Chat History Panel */}
              <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        {!isUser && (
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${selectedPersona.avatarColor} flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm`}>
                            {selectedPersona.name[0]}
                          </div>
                        )}
                        
                        <div className="space-y-0.5">
                          {/* Bubble */}
                          <div className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm shadow-sm leading-relaxed ${
                            isUser
                              ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white font-medium rounded-br-none'
                              : 'bg-gray-100 dark:bg-[#1a1a26] text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-50 dark:border-white/[0.02]'
                          }`}>
                            {msg.text}
                          </div>
                          
                          {/* Time */}
                          <div className={`text-[9px] text-gray-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Animated Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-end space-x-2">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${selectedPersona.avatarColor} flex items-center justify-center text-white text-[10px] font-black shrink-0`}>
                        {selectedPersona.name[0]}
                      </div>
                      <div className="px-4 py-3 bg-gray-100 dark:bg-[#1a1a26] rounded-2xl rounded-bl-none flex items-center space-x-1 border border-gray-50 dark:border-white/[0.02]">
                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01] flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isTyping}
                  placeholder={`Send ${selectedPersona.name} a clever reply...`}
                  autoFocus
                  className="flex-1 bg-white dark:bg-[#0c0c14] border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs md:text-sm text-gray-800 dark:text-gray-100 outline-none focus:border-pink-500/50 transition-all placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className={`p-3.5 rounded-2xl flex items-center justify-center text-white transition-all ${
                    !inputText.trim() || isTyping
                      ? 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:scale-105 active:scale-95 shadow-md shadow-pink-500/10'
                  }`}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>

            {/* Sync Coaching column */}
            {latestAnalysis && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-5 flex flex-col bg-white dark:bg-[#12121a] border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm p-5 space-y-5 justify-between"
              >
                <div className="space-y-5">
                  {/* Title */}
                  <div className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-3">
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles size={16} className="text-amber-500" />
                      <span>Rizz Analyzer</span>
                    </h3>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Latest Text Evaluated</span>
                  </div>
 
                  {/* Circular Sync Meter */}
                  <div className="flex flex-col items-center justify-center py-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
                    
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#f3f4f6" className="dark:stroke-white/5" strokeWidth="8" fill="transparent" />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="url(#sync-gradient)"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray="251.2"
                          initial={{ strokeDashoffset: 251.2 }}
                          animate={{ strokeDashoffset: 251.2 - (251.2 * latestAnalysis.rizzScore) / 100 }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                        <defs>
                          <linearGradient id="sync-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="50%" stopColor="#f43f5e" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">
                          {latestAnalysis.rizzScore}%
                        </span>
                        <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Sync Level</span>
                      </div>
                    </div>
 
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${getRatingBadgeClass(latestAnalysis.rizzRating)}`}>
                        {latestAnalysis.rizzRating === 'Spicy' ? '🔥 Spicy' : 
                         latestAnalysis.rizzRating === 'Sweet' ? '🧸 Sweet' : 
                         latestAnalysis.rizzRating === 'Safe' ? '🛡️ Safe' : 
                         latestAnalysis.rizzRating === 'Dry' ? '🏜️ Dry' : '❄️ Awkward'}
                      </span>
                    </div>
                  </div>
 
                  {/* Feedback Card */}
                  <div className="space-y-2.5">
                    <h4 className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-pink-500" />
                      <span>Rizz Coaching Advice</span>
                    </h4>
                    <div className="bg-pink-50/50 dark:bg-pink-500/5 border border-pink-100/30 dark:border-pink-500/10 p-4 rounded-2xl">
                      <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                        "{latestAnalysis.feedback}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions group */}
                <div className="space-y-2.5 mt-4">
                  {/* Share to Instagram Story */}
                  <button
                    onClick={handleShareClick}
                    className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-extrabold rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-pink-500/20 uppercase tracking-wider"
                  >
                    <Instagram size={16} />
                    <span>Share Sync Level</span>
                  </button>

                  {/* Back to Persona selection */}
                  <button
                    onClick={() => setSelectedPersona(null)}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-100 text-xs font-bold rounded-2xl transition-all text-center"
                  >
                    Change Practice Match
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal AnimatePresence */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg bg-[#0e0e14] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Header */}
              <div className="text-center space-y-1">
                <h3 className="text-xl md:text-2xl font-black text-white flex items-center justify-center gap-2">
                  <Instagram size={20} className="text-pink-500" />
                  <span>Share to Instagram Story</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Show off your Sync Score on Instagram Stories in 3 quick steps!
                </p>
              </div>

              {/* Story Card Preview & Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Card Preview */}
                <div className="flex flex-col items-center justify-center space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Story Preview</span>
                  {shareImageUrl && (
                    <div className="relative w-[150px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-pink-500/5 group">
                      <img
                        src={shareImageUrl}
                        alt="Sync Score Story Card"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <button
                          onClick={handleDownloadCard}
                          className="p-2 bg-pink-500 text-white rounded-full hover:scale-110 transition-all"
                          title="Download image"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Steps */}
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-pink-500 text-[10px] font-extrabold flex items-center justify-center text-white">1</span>
                      <span className="text-xs font-extrabold text-white">Save Achievement Graphic</span>
                    </div>
                    <button
                      onClick={handleDownloadCard}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 border border-white/10"
                    >
                      <span>Download Story Card 📥</span>
                    </button>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-pink-500 text-[10px] font-extrabold flex items-center justify-center text-white">2</span>
                      <span className="text-xs font-extrabold text-white">Copy Custom Tag Caption</span>
                    </div>
                    <button
                      onClick={handleCopyCaption}
                      className={`w-full py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 border ${
                        isCopied
                          ? 'bg-green-500/20 border-green-500/30 text-green-400'
                          : 'bg-white/5 hover:bg-white/10 text-gray-200 border-white/10'
                      }`}
                    >
                      <span>{isCopied ? 'Copied Caption! ✅' : 'Copy Caption & Tag 📋'}</span>
                    </button>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-pink-500 text-[10px] font-extrabold flex items-center justify-center text-white">3</span>
                      <span className="text-xs font-extrabold text-white">Share on Instagram Story</span>
                    </div>
                    <button
                      onClick={handleOpenInstagram}
                      className="w-full py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:scale-105 active:scale-95 text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-pink-500/10"
                    >
                      <Instagram size={14} />
                      <span>Open Instagram 📸</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PracticeArena;
