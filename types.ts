
export enum InputMode {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export enum Tone {
  POLITE = 'Polite',
  FRIENDLY = 'Friendly',
  CONFIDENT = 'Confident',
  PLAYFUL = 'Playful',
  FLIRTY = 'Flirty',
  SARCASTIC = 'Sarcastic',
  CASUAL = 'Casual',
  DRAMATIC = 'Dramatic',
}

export enum Language {
  ENGLISH = 'English',
  HINGLISH = 'Hinglish',
  HINDI = 'Hindi',
}

export enum TextStyle {
  STANDARD = 'Standard', // "Okay", "Yes", "You"
  SHORT = 'Short/Txt',   // "k", "ya", "u"
  CUTE = 'Cute/Soft',    // "okieee", "yesss", "yuuu"
  LONG = 'Long/Deep',    // Detailed, full sentences
}

export interface ReplyOption {
  id: string;
  text: string;
  style: 'Safe' | 'Balanced' | 'Bold';
}

export interface AnalysisResult {
  stage: string;
  intent: string;
  advice: string;
}

export interface GeneratedResponse {
  replies: ReplyOption[];
  analysis: AnalysisResult;
}

export interface SavedReply {
  id: string; // unique ID for saved reply
  text: string;
  source: 'ReplyWithConfidence' | 'Ghosting' | 'Conflict' | 'SyncGifts';
  timestamp: string; // ISO Date
}

export interface User {
  name: string;
  email: string;
  isPremium: boolean;
  credits: number;
  lastCreditReset: string; // ISO Date string
  savedReplies?: SavedReply[];
  tutorialSeen?: boolean;
}

export interface UserCredits {
  remaining: number;
  isPremium: boolean;
}

// --- Ghosting Feature Types ---

export interface GhostingReply {
  id: string;
  text: string;
  strategy: string;
  recoveryChance: number; // 0-100 percentage
  explanation: string;
}

export interface GhostingResponse {
  analysis: string;
  replies: GhostingReply[];
}

// --- Conflict Resolution Types ---

export interface ConflictProfile {
  userGender: string;
  partnerGender: string;
  relationshipType: string;
  duration: string;
  reason: string;
  userFeeling: string;
  partnerFeeling: string;
  description: string;
  language: Language;
}

export interface ConflictReply {
  id: string;
  text: string;
  type: string; // Soft Repair, Balanced Honest, Boundary + Care
  whyItWorks: string;
}

export interface ConflictResolutionResponse {
  insight: string;
  guidance: string;
  replies: ConflictReply[];
  tips: string[];
}

// --- Gift Intelligence Types ---

export type GiftRelationship = 'Partner' | 'Crush' | 'Friend' | 'Family' | 'Special Someone';
export type GiftOccasion = 'Birthday' | 'Anniversary' | 'Apology' | 'Surprise' | 'Celebration' | 'Just Because';
export type GiftPersonality = 'Romantic' | 'Minimalist' | 'Creative' | 'Luxury' | 'Sentimental' | 'Funny';
export interface Product {
  id: string;
  image: string;
  title: string;
  price: number;
  store: string;
  rating: number;
  link: string;
}

export interface GiftProfile {
  recipientGender: 'Male' | 'Female' | 'Unisex';
  relationship: GiftRelationship;
  occasion: GiftOccasion;
  personality: GiftPersonality;
  budget: [number, number]; // [min, max]
  additionalContext?: string;
}

export interface GiftRecommendation {
  id: string;
  type: 'Sentimental' | 'Affordable' | 'Premium';
  title: string;
  description: string;
  whyItWorks: string;
  impactScore: number; // 1-10
  suggestedMessage: string;
  surpriseIdea: string;
  materialsNote?: string;
  searchKeywords?: string;
  products?: Product[];
}

export interface GiftResponse {
  analysis: string;
  recommendations: GiftRecommendation[];
}
