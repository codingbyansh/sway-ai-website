import { Tone, Language, GeneratedResponse, TextStyle, GhostingResponse, ConflictProfile, ConflictResolutionResponse, GiftProfile, GiftResponse, Product } from "../types";
import { fetchProductsFromMarketplace } from "./marketplaceService";

// ==========================================
// MODEL CONFIGURATION
// ==========================================

// HuggingFace — uses OpenAI-compatible chat completions via the router
const HF_CHAT_ENDPOINT = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "Qwen/Qwen2.5-72B-Instruct";

// ==========================================
// HELPERS
// ==========================================

const cleanJsonString = (str: string): string => {
  let cleaned = str.trim();
  // Remove any markdown code block markers
  cleaned = cleaned.replace(/```json\s?/g, '').replace(/```\s?/g, '').trim();
  // If there's content before the first { or after the last }, strip it
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
};

const getHFToken = (): string | null => {
  const token = import.meta.env.VITE_HF_ACCESS_TOKEN;
  if (!token || token.includes('YOUR_')) return null;
  return token;
};

const getGeminiKey = (): string | null => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key.includes('YOUR_')) return null;
  return key;
};

async function callGemini(systemPrompt: string, userPrompt: string, base64Image?: string | null): Promise<string> {
  const key = getGeminiKey();
  if (!key) throw new Error("Gemini API key not configured.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

  const parts: any[] = [];
  
  if (base64Image) {
    const commaIndex = base64Image.indexOf(',');
    const base64Data = commaIndex !== -1 ? base64Image.substring(commaIndex + 1) : base64Image;
    
    let mimeType = "image/jpeg";
    const match = base64Image.match(/^data:(image\/[a-zA-Z+-\.]+);base64,/);
    if (match) {
      mimeType = match[1];
    }
    
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data
      }
    });
  }

  parts.push({ text: `${systemPrompt}\n\nUser Request:\n${userPrompt}` });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: parts
        }
      ]
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error("Unexpected Gemini response format.");
}

const getStyleInstructions = (style: TextStyle): string => {
  switch (style) {
    case TextStyle.SHORT:
      return "SHORT / TXT (Gen Z Casual): Strictly lowercase, no periods, use 'u', 'r', 'rn', 'bc', drop pronouns.";
    case TextStyle.CUTE:
      return "CUTE / SOFT: Softer punctuation (~, ...), elongated vowels (heyyy), warm and bubbly vibe.";
    case TextStyle.LONG:
      return "LONG / DEEP: Complete sentences, articulated thoughts, thoughtful and charming tone.";
    default:
      return "STANDARD: Normal text messaging, balanced, natural Hinglish/English.";
  }
};

// ==========================================
// HUGGING FACE — OpenAI-Compatible Chat API
// ==========================================

async function callHuggingFace(systemPrompt: string, userPrompt: string): Promise<string> {
  const token = getHFToken();
  if (!token) throw new Error("Hugging Face token not configured.");

  const response = await fetch(HF_CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error("HF API Error:", response.status, errorText);

    if (response.status === 503) {
      throw new Error("HF model is loading. Try again in ~30 seconds.");
    }
    if (response.status === 429) {
      throw new Error("HF rate limit reached. Please wait a minute.");
    }
    throw new Error(`HuggingFace API error (${response.status})`);
  }

  const data = await response.json();

  // OpenAI-compatible format: { choices: [{ message: { content: "..." } }] }
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  throw new Error("Unexpected HuggingFace response format.");
}

// ==========================================
// UNIFIED AI CALL — Primarily Hugging Face
// ==========================================

async function callAI(systemPrompt: string, userPrompt: string, imageData?: string | null): Promise<string> {
  const errors: string[] = [];

  // 1. Try Gemini primarily (highly reliable & handles Indian context/Hinglish exceptionally well)
  if (getGeminiKey()) {
    try {
      console.log("🚀 Trying Gemini (gemini-2.5-flash)...");
      const text = await callGemini(systemPrompt, userPrompt, imageData);
      console.log("✅ Gemini succeeded");
      return text;
    } catch (err: any) {
      console.warn("❌ Gemini failed:", err?.message);
      errors.push(`Gemini: ${err?.message}`);
    }
  }

  // 2. Try Hugging Face fallback
  if (getHFToken()) {
    try {
      console.log("🤗 Trying Hugging Face (Qwen2.5-72B)...");
      const hfPrompt = imageData
        ? userPrompt + "\n\n(Note: An image was provided. Generate replies based on the text context provided from OCR.)"
        : userPrompt;
      const text = await callHuggingFace(systemPrompt, hfPrompt);
      console.log("✅ Hugging Face succeeded");
      return text;
    } catch (err: any) {
      console.warn("❌ Hugging Face failed:", err?.message);
      errors.push(`Hugging Face: ${err?.message}`);
    }
  }

  // Throw an error if all AI providers failed
  throw new Error(`All AI providers failed: ${errors.join(' | ')}`);
}

// ==========================================
// PARSE JSON — robust extraction with fallback
// ==========================================

function parseAIJson<T>(rawText: string, label: string): T {
  const cleaned = cleanJsonString(rawText);
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find any JSON-like substring starting with { and ending with }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const potentialJson = cleaned.substring(firstBrace, lastBrace + 1);
        return JSON.parse(potentialJson);
      } catch {}
    }

    // Try regex-based matches for replies key
    const jsonMatch = cleaned.match(/\{[\s\S]*"replies"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {}
    }

    // Try standard generic JSON match
    const genericJsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (genericJsonMatch) {
      try {
        return JSON.parse(genericJsonMatch[0]);
      } catch {}
    }

    console.error(`Failed to parse ${label} response:`, cleaned.substring(0, 500));
    throw new Error(`AI returned an invalid response for ${label}. Please try again.`);
  }
}

export async function extractTextFromImage(imageData: string): Promise<string> {
  const ocrPrompt = "Perform high-accuracy OCR on this chat screenshot. Extract and transcribe every single message, visible name, and timestamp. Return ONLY the transcribed text. Do NOT include any introduction, explanations, or markdown formatting.";

  // 1. Try Gemini primarily (highly reliable OCR for images)
  const geminiKey = getGeminiKey();
  if (geminiKey) {
    try {
      console.log("🔍 Extracting text from image using Gemini...");
      const text = await callGemini("You are a high-accuracy OCR assistant.", ocrPrompt, imageData);
      console.log("✅ Gemini OCR succeeded");
      return text.trim();
    } catch (e: any) {
      console.warn("❌ Gemini OCR failed:", e.message);
    }
  }

  // 2. Try Hugging Face fallback
  const token = getHFToken();
  if (token) {
    try {
      console.log("🔍 Extracting text from image using Hugging Face...");
      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.2-11B-Vision-Instruct",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: ocrPrompt },
                { type: "image_url", image_url: { url: imageData } }
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
          console.log("✅ HF OCR succeeded");
          return data.choices[0].message.content.trim();
        }
      }
    } catch (e: any) {
      console.warn("❌ Hugging Face OCR failed:", e.message);
    }
  }

  throw new Error("Vision OCR failed on both AI models. Please try typing the message manually.");
}

// ==========================================
// EXPORTED FUNCTIONS
// ==========================================

export const generateReplies = async (
  inputText: string,
  imageData: string | null,
  tone: Tone,
  language: Language,
  useEmojis: boolean,
  textStyle: TextStyle
): Promise<GeneratedResponse> => {
  const emojiInstruction = useEmojis
    ? "Include 1-2 relevant emojis naturally."
    : "STRICTLY NO EMOJIS.";

  const styleGuide = getStyleInstructions(textStyle);

  let finalInputText = inputText;

  // Extract text from image if imageData is provided
  if (imageData) {
    try {
      const extractedText = await extractTextFromImage(imageData);
      finalInputText = finalInputText
        ? `${finalInputText}\n\n[Extracted from Image]:\n${extractedText}`
        : `[Extracted from Image]:\n${extractedText}`;
    } catch (err: any) {
      console.error("OCR Failed:", err);
      // Fallback: Continue with original behavior if OCR fails
    }
  }

  const systemPrompt = `You are SYNC, an AI dating assistant for the Indian market.
Principles: Use Hinglish/Indian English, be witty but respectful.
Tone: ${tone}. Style: ${styleGuide}. Emojis: ${emojiInstruction}.
Generate 3 reply options (Safe, Balanced, Bold) in ${language}.
Also evaluate the overall conversation history, calculate a "score" (0 to 100) for the alignment/chemistry (Sync Level), and select a "rating" ('Spicy' | 'Sweet' | 'Safe' | 'Dry' | 'Awkward').
Output MUST be strict JSON. No markdown, no code blocks, just raw JSON.`;

  const userPrompt = `Input Context:
${finalInputText ? `Message: "${finalInputText}"` : 'Image: Attached screenshot.'}

Task: Analyze the vibe, calculate Sync Score, and generate 3 reply options.
Return this exact JSON structure:
{"analysis": {"stage": "...", "intent": "...", "advice": "...", "score": 70, "rating": "Sweet"}, "replies": [{"id": "1", "text": "...", "style": "Safe"}, {"id": "2", "text": "...", "style": "Balanced"}, {"id": "3", "text": "...", "style": "Bold"}]}`;

  try {
    const rawText = await callAI(systemPrompt, userPrompt, null);
    return parseAIJson<GeneratedResponse>(rawText, "reply generation");
  } catch (err) {
    console.warn("Using offline mock fallback for reply generation.");
    return {
      analysis: {
        stage: "Active Dialogue",
        intent: "Building Rapport",
        advice: "They are responding well! Maintain this high positive energy and transition to a playful challenge.",
        score: 70,
        rating: "Sweet"
      },
      replies: [
        { id: "1", text: "Hey! How has your week been so far? 😊", style: "Safe" },
        { id: "2", text: "Hey! What are you up to today?", style: "Balanced" },
        { id: "3", text: "We should definitely grab a drink sometime this week! 😉", style: "Bold" }
      ]
    };
  }
};

export const recoverFromGhosting = async (
  partnerGender: string,
  details: string,
  language: Language,
  textStyle: TextStyle,
  useEmojis: boolean
): Promise<GhostingResponse> => {
  const systemPrompt = `You are an expert dating psychologist and ghosting recovery specialist for the Indian market.
Language: ${language}. Style: ${getStyleInstructions(textStyle)}. Emojis: ${useEmojis ? 'Include naturally' : 'STRICTLY NO EMOJIS'}.
Output MUST be strict JSON only. No markdown, no code blocks.`;

  const userPrompt = `Ghosting Situation:
- Partner Gender: ${partnerGender}
- Details: "${details}"

Return this exact JSON:
{"analysis": "Brief analysis (max 20 words)", "replies": [{"id": "1", "text": "...", "strategy": "...", "recoveryChance": 85, "explanation": "..."}, {"id": "2", "text": "...", "strategy": "...", "recoveryChance": 70, "explanation": "..."}, {"id": "3", "text": "...", "strategy": "...", "recoveryChance": 60, "explanation": "..."}]}`;

  try {
    const rawText = await callAI(systemPrompt, userPrompt);
    return parseAIJson<GhostingResponse>(rawText, "ghosting recovery");
  } catch (err) {
    console.warn("Using offline mock fallback for ghosting recovery.");
    return {
      analysis: "High chance of recovery. Keep it low-pressure.",
      replies: [
        { id: "1", text: "Hey, saw this and thought of you. Hope you're doing well! 😊", strategy: "Casual Check-in", recoveryChance: 85, explanation: "A simple, low-pressure friendly check-in." },
        { id: "2", text: "Hey! Are you still alive or did you get eaten by a tiger? 🐯", strategy: "Playful Banter", recoveryChance: 70, explanation: "A funny and engaging tease to break the ice." },
        { id: "3", text: "No worries at all, let me know if you want to catch up later! standard.", strategy: "Classy Close", recoveryChance: 60, explanation: "Polite but standard close." }
      ]
    };
  }
};

export const resolveConflict = async (profile: ConflictProfile): Promise<ConflictResolutionResponse> => {
  const systemPrompt = `You are SYNC's "Talk It Out" mode — an emotionally intelligent relationship-resolution AI for Indian couples.
Principles: Indian context, neutrality, empathy, no blame. Language: ${profile.language}.
Output MUST be strict JSON only. No markdown, no code blocks.`;

  const userPrompt = `Conflict Profile:
- User: ${profile.userGender} (${profile.userFeeling})
- Partner: ${profile.partnerGender} (${profile.partnerFeeling})
- Relationship: ${profile.relationshipType}, ${profile.duration}
- Reason: ${profile.reason}
- Context: "${profile.description}"

Return this exact JSON:
{"insight": "...", "guidance": "...", "replies": [{"id": "1", "text": "...", "type": "Soft Repair", "whyItWorks": "..."}, {"id": "2", "text": "...", "type": "Balanced Honest", "whyItWorks": "..."}, {"id": "3", "text": "...", "type": "Boundary + Care", "whyItWorks": "..."}], "tips": ["...", "...", "..."]}`;

  try {
    const rawText = await callAI(systemPrompt, userPrompt);
    return parseAIJson<ConflictResolutionResponse>(rawText, "conflict resolution");
  } catch (err) {
    console.warn("Using offline mock fallback for conflict resolution.");
    return {
      insight: "Tensions are high, but framing your feelings constructively will immediately disarm defenses.",
      guidance: "Acknowledge the core emotion, establish a shared goal, and propose a collaborative solution.",
      replies: [
        { id: "1", text: "I completely understand why you felt that way, and I really want to understand your side better.", type: "Soft Repair", whyItWorks: "Validates their experience instantly." },
        { id: "2", text: "Let's work through this and figure it out together as a team.", type: "Balanced Honest", whyItWorks: "Bridges the gap as a team." },
        { id: "3", text: "I think I just need a little bit of space to collect my thoughts, but I care about us.", type: "Boundary + Care", whyItWorks: "Clearly defines boundaries while retaining care." }
      ],
      tips: ["Keep a calm, steady breathing pace.", "Avoid using accusatory 'you' sentences.", "Prioritize connection over winning."]
    };
  }
};

export const generateGiftRecommendations = async (profile: GiftProfile): Promise<GiftResponse> => {
  const systemPrompt = `You are "Sync Gifts" AI. Focus: Precious, emotional, high-impact gifts. 
Brief guidance only. 3 categories: Sentimental, Affordable, Premium.
Output: Strict JSON.`;

  const userPrompt = `Request: ${profile.relationship}, ${profile.occasion}, ${profile.personality}, Budget: ₹${profile.budget[0]}-₹${profile.budget[1]}. ${profile.additionalContext || ""}
Return:
{
  "analysis": "Emotional insight (10 words)",
  "recommendations": [
    {
      "type": "Sentimental",
      "title": "...",
      "description": "...",
      "materialsNote": "DIY guide",
      "whyItWorks": "...",
      "impactScore": 10,
      "suggestedMessage": "...",
      "surpriseIdea": "..."
    },
    {
      "type": "Affordable",
      "title": "...",
      "description": "...",
      "searchKeywords": "Specific Brand + Model (e.g. 'Casio Vintage Watch')",
      "whyItWorks": "...",
      "impactScore": 8,
      "suggestedMessage": "...",
      "surpriseIdea": "..."
    },
    {
      "type": "Premium",
      "title": "...",
      "description": "...",
      "searchKeywords": "Luxury Brand + Model (e.g. 'Skinn by Titan Celeste')",
      "whyItWorks": "...",
      "impactScore": 9,
      "suggestedMessage": "...",
      "surpriseIdea": "..."
    }
  ]
}`;

  try {
    const rawText = await callAI(systemPrompt, userPrompt);
    return parseAIJson<GiftResponse>(rawText, "gift recommendations");
  } catch (err) {
    console.warn("Using offline mock fallback for gift recommendations.");
    return {
      analysis: "High emotional impact and personalization matters most.",
      recommendations: [
        {
          type: "Sentimental",
          title: "Customized Memory Book",
          description: "A beautifully bound booklet of your first chat messages, photos, and inside jokes.",
          materialsNote: "DIY guide or local photobook service",
          whyItWorks: "Deep emotional value that demonstrates high thought.",
          impactScore: 10,
          suggestedMessage: "Every moment with you is worth saving.",
          surpriseIdea: "Hide it under their pillow."
        },
        {
          type: "Affordable",
          title: "Scented Candle Set",
          description: "A luxury soy wax candle set with lavender or warm vanilla aromas.",
          searchKeywords: "Specific Brand + Model (e.g. 'Miniso Scented Candle')",
          whyItWorks: "Creates a relaxing cozy mood.",
          impactScore: 8,
          suggestedMessage: "To brighten up your room just like you do to my days.",
          surpriseIdea: "Light it right before they enter the room."
        },
        {
          type: "Premium",
          title: "Vintage Quartz Watch",
          description: "A classic, elegant analogue watch with a mesh band.",
          searchKeywords: "Luxury Brand + Model (e.g. 'Skinn by Titan Celeste')",
          whyItWorks: "Timeless accessory they will wear daily.",
          impactScore: 9,
          suggestedMessage: "Here is to all the beautiful time we have ahead of us.",
          surpriseIdea: "Gift wrap it in a double box."
        }
      ]
    };
  }
};

// ==========================================
// PRACTICE AREA & ICEBREAKER SERVICES
// ==========================================

export interface PracticeAnalysisResponse {
  rizzScore: number;
  rizzRating: 'Spicy' | 'Sweet' | 'Safe' | 'Dry' | 'Awkward';
  feedback: string;
  personaReply: string;
}

export const analyzePracticeReply = async (
  personaId: string,
  chatHistory: { role: 'user' | 'assistant'; text: string }[],
  userMessage: string
): Promise<PracticeAnalysisResponse> => {
  const historyText = chatHistory
    .map((m) => `${m.role === 'user' ? 'User' : 'Persona'}: "${m.text}"`)
    .join('\n');

  const systemPrompt = `You are a relationship Sync AI analyzing a practice chat session.
You must analyze the User's latest message and reply in-character as the dating persona.
Personas:
1. "dry_texter" (Sneha, 21): Gen Z, dry, cold, texts in short 1-3 word lowercase sentences, very hard to impress, uses dry Hinglish/English.
2. "over_flirty" (Kabir, 23): Extremely flirty, cheesy, uses pickup lines, playful, energetic, very encouraging.
3. "busy_pro" (Aanya, 26): Corporate consultant, busy, formal, values intellectual conversation, polite but structured.
4. "high_standards" (Ishaan, 24): High standards, loves witty banter, sarcastic, loves being challenged.
5. "bollywood_buff" (Riya, 22): Bollywood obsessive, dramatic, expressive, speaks in an energetic mix of Hinglish and Hindi, uses filmy drama and iconic dialogue banter.
6. "techie_meme" (Arjun, 25): Casual Bangalore software developer, speaks in casual Hinglish and English, uses tech analogies and memes, very friendly and easygoing.

Task:
1. Rate the User's latest message. Calculate a "rizzScore" (0 to 100).
2. Assign a "rizzRating" ('Spicy' | 'Sweet' | 'Safe' | 'Dry' | 'Awkward').
3. Provide constructive Sync AI "feedback" (max 30 words) on how to improve.
4. Generate the persona's next realistic "personaReply" in character based on the conversation history and userMessage.

Output MUST be strict JSON matching this exact structure:
{"rizzScore": 85, "rizzRating": "Spicy", "feedback": "...", "personaReply": "..."}`;

  const userPrompt = `Dating Persona Selected: "${personaId}"
Conversation History So Far:
${historyText || "(No history yet)"}
User's Latest Message: "${userMessage}"

Generate the JSON evaluation. Ensure the personaReply is 100% in-character.`;

  try {
    const rawText = await callAI(systemPrompt, userPrompt);
    return parseAIJson<PracticeAnalysisResponse>(rawText, "practice reply analysis");
  } catch (err) {
    // Offline / Error Fallback
    console.warn("Using offline mock fallback for practice reply analysis.");
    
    // Choose fallback replies based on personaId and basic keywords
    let score = 50;
    let rating: 'Spicy' | 'Sweet' | 'Safe' | 'Dry' | 'Awkward' = 'Safe';
    let feedback = "Nice, safe approach. Try adding some humor or teasing to make it stand out!";
    let reply = "Oh nice, tell me more.";

    const lowercaseMsg = userMessage.toLowerCase();

    if (personaId === 'dry_texter') {
      if (lowercaseMsg.length < 10) {
        score = 25;
        rating = 'Dry';
        feedback = "Too brief! Dry texters need engaging, open-ended hooks to get them talking.";
        reply = "k";
      } else if (lowercaseMsg.includes('?') || lowercaseMsg.includes('you')) {
        score = 65;
        rating = 'Sweet';
        feedback = "Good job asking questions. It pushes them to speak slightly more.";
        reply = "not much, just chilling. u?";
      } else {
        score = 45;
        rating = 'Safe';
        feedback = "Decent reply, but lacks flavor. Make a bold assumption about her.";
        reply = "cool.";
      }
    } else if (personaId === 'over_flirty') {
      if (lowercaseMsg.includes('love') || lowercaseMsg.includes('cute') || lowercaseMsg.includes('flirt')) {
        score = 90;
        rating = 'Spicy';
        feedback = "Amazing! Match their energy and double down on the playfulness!";
        reply = "Stop it, you're making me blush through the screen! 😉 Tell me more!";
      } else {
        score = 70;
        rating = 'Sweet';
        feedback = "Sweet reply, they are loving your positive energy. Keep it flirty!";
        reply = "Haha you're so sweet! What are you up to tonight? ✨";
      }
    } else if (personaId === 'busy_pro') {
      if (lowercaseMsg.includes('work') || lowercaseMsg.includes('career') || lowercaseMsg.includes('consulting') || lowercaseMsg.length > 25) {
        score = 85;
        rating = 'Spicy';
        feedback = "Perfect. Intelligent and articulate replies impress busy professionals.";
        reply = "Exactly, it gets quite hectic but it is rewarding. What industry are you in?";
      } else {
        score = 55;
        rating = 'Safe';
        feedback = "A bit too informal. Try asking about their profession or projects.";
        reply = "I see. Sorry, got caught up in a meeting. How was your day?";
      }
    } else if (personaId === 'high_standards') {
      if (lowercaseMsg.includes('challenge') || lowercaseMsg.includes('bet') || lowercaseMsg.includes('sarcasm')) {
        score = 95;
        rating = 'Spicy';
        feedback = "Brilliant banter! They love when you stand your ground and play along.";
        reply = "Haha, is that a challenge? I like the confidence. Let's see if you can back it up.";
      } else if (lowercaseMsg.length < 8) {
        score = 30;
        rating = 'Awkward';
        feedback = "A bit boring. Sarcastic matches lose interest quickly if you aren't witty.";
        reply = "Is that all you've got? I expected a better comeback tbh.";
      } else {
        score = 60;
        rating = 'Safe';
        feedback = "Good, safe reply, but try to add a sarcastic twist or a playful tease.";
        reply = "Fair enough. So, tell me something interesting about yourself then.";
      }
    } else if (personaId === 'bollywood_buff') {
      if (lowercaseMsg.includes('bollywood') || lowercaseMsg.includes('filmy') || lowercaseMsg.includes('movie') || lowercaseMsg.includes('simran')) {
        score = 95;
        rating = 'Spicy';
        feedback = "Outstanding! FILMY context instantly captures her high-energy dramatic vibe.";
        reply = "Arre! You also love movies? Dil bole hadippa! 🍿 Chalo, tell me your favorite filmy dialogue first!";
      } else {
        score = 75;
        rating = 'Sweet';
        feedback = "Sweet reply, she likes your style. Throw in a classic filmy dialogue to win her!";
        reply = "Haha you're so sweet! But is your life as dramatic as a KJo film? ✨";
      }
    } else if (personaId === 'techie_meme') {
      if (lowercaseMsg.includes('code') || lowercaseMsg.includes('tech') || lowercaseMsg.includes('chai') || lowercaseMsg.includes('debug')) {
        score = 90;
        rating = 'Spicy';
        feedback = "Perfect! Sharing funny tech jokes or chai plans builds a strong direct connection.";
        reply = "Aha! Spoken like a true coder. Chai is basically compiler fuel. 😉 What is your favorite tech stack?";
      } else {
        score = 70;
        rating = 'Sweet';
        feedback = "Friendly and cozy reply. Suggest a coding break or chai date to upgrade the level!";
        reply = "Haha, sounds great! What are you working on or up to tonight?";
      }
    }

    return {
      rizzScore: score,
      rizzRating: rating,
      feedback,
      personaReply: reply,
    };
  }
};

export const fetchIcebreakers = async (category: string): Promise<string[]> => {
  const systemPrompt = `You are charismatic Sync AI.
Generate exactly 3 extremely creative, highly engaging dating icebreakers for the category: "${category}".
Make sure they are witty, tailored to the vibe, and prompt an immediate response.
If the category is Indian or Hinglish, use modern colloquial Hinglish.
Return a strict JSON array of strings: ["icebreaker 1", "icebreaker 2", "icebreaker 3"].`;

  const userPrompt = `Generate 3 icebreakers for: "${category}". Output JSON ONLY.`;

  try {
    const rawText = await callAI(systemPrompt, userPrompt);
    return parseAIJson<string[]>(rawText, "icebreaker generation");
  } catch (err) {
    console.warn("Using offline mock fallback for icebreakers.");
    if (category === 'Gen Z Hinglish') {
      return [
        "Hey! Are you a backbencher? Because you look like a lot of fun and trouble. 😉",
        "Your profile gives off high vibes. Please tell me you don't listen to sad songs on repeat. 😂",
        "Chai or Coffee? Choose wisely, this is a filtration test."
      ];
    } else if (category === 'Spicy Flirty') {
      return [
        "I'm not saying you're my type, but if you were a song, you'd be on repeat. 🔥",
        "Do you believe in love at first swipe, or should I swipe right on you again? 😉",
        "Your profile looks great, but it's missing one thing: a text from me."
      ];
    } else if (category === 'Deep & Weird') {
      return [
        "Quick! What's your absolute worst, most indefensible food opinion? 🍍🍕",
        "If you could have a useless superpower, like knowing if a tomato is sweet by touching it, what would it be?",
        "What's a weird hill you are absolutely willing to die on?"
      ];
    } else {
      // Awkward Recovery / Default
      return [
        "Hey! I promise I'm not usually this awkward, but you look way too cool to pass by.",
        "My dog saw your profile and barked twice, which means 'Swipe Right immediately!' 🐶",
        "Let's skip the small talk: what's the last thing that made you laugh out loud?"
      ];
    }
  }
};

export interface DailyDareVerificationResponse {
  completed: boolean;
  score: number;
  feedback: string;
}

export const verifyDailyDareCompletion = async (
  dareTitle: string,
  dareDescription: string,
  userProof: string
): Promise<DailyDareVerificationResponse> => {
  const systemPrompt = `You are SYNC's AI validating a completed dating/confidence challenge.
Determine if the user's proof text indicates they actually attempted or completed the dare.
Be encouraging, witty, slightly sarcastic (Sync AI style), and rate their performance from 0 to 100.
If the proof is too brief (e.g. less than 5 letters), completely unrelated, or generic nonsense, set completed to false.
Output MUST be strict JSON only, matching this structure:
{"completed": true/false, "score": 85, "feedback": "Your witty Sync AI comment here (under 30 words)"}`;

  const userPrompt = `Dare: "${dareTitle}"
Description: "${dareDescription}"
User's Completion Proof: "${userProof}"

Generate the JSON evaluation.`;

  try {
    const rawText = await callAI(systemPrompt, userPrompt);
    return parseAIJson<DailyDareVerificationResponse>(rawText, "daily dare verification");
  } catch (err) {
    console.warn("Using offline mock fallback for daily dare verification.");
    const completed = userProof.trim().length >= 10;
    const score = completed ? 70 + Math.floor(Math.random() * 26) : 30;
    return {
      completed,
      score,
      feedback: completed
        ? "Wow, look at you! That took some real guts. Sync AI approved! +25 Credits. 😎"
        : "Hmm, that seems a bit too short or incomplete. Give it another shot and tell me more details!"
    };
  }
};


