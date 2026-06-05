
import { Tone, Language } from './types';

export const APP_NAME = "SYNC AI";

export const TONE_DESCRIPTIONS: Record<Tone, string> = {
  [Tone.POLITE]: "Soft, respectful, safe",
  [Tone.FRIENDLY]: "Warm, open, conversational",
  [Tone.CONFIDENT]: "Assertive, direct, attractive",
  [Tone.PLAYFUL]: "Light humor, wholesome teasing",
  [Tone.FLIRTY]: "Romantic, spicy, suggestive",
  [Tone.SARCASTIC]: "Witty, dry, edgy humor",
  [Tone.CASUAL]: "Low effort, chill, brief",
  [Tone.DRAMATIC]: "Expressive, emotional, extra",
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  [Language.ENGLISH]: "🇬🇧 English",
  [Language.HINGLISH]: "🇮🇳 Hinglish",
  [Language.HINDI]: "🇮🇳 Hindi",
};

export const INITIAL_CREDITS = 5;

export const MOCK_LOADING_MESSAGES = [
  "Analyzing conversation flow...",
  "Checking cultural nuances...",
  "Applying safety filters...",
  "Crafting the perfect reply...",
  "Adding a touch of charm..."
];
