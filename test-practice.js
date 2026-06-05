const apiKey = "AQ.Ab8RN6ITUPFeQ5oY-hYQvBAkWuh34d1C3LJ_juruR4YTgNSBiQ";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

const systemPrompt = `You are a relationship Wingman AI analyzing a practice chat session.
You must analyze the User's latest message and reply in-character as the dating persona.
Personas:
1. "dry_texter" (Sneha, 21): Gen Z, dry, cold, texts in short 1-3 word lowercase sentences, very hard to impress, uses dry Hinglish/English.
2. "over_flirty" (Kabir, 23): Extremely flirty, cheesy, uses pickup lines, playful, energetic, very encouraging.
3. "busy_pro" (Aanya, 26): Corporate consultant, busy, formal, values intellectual conversation, polite but structured.
4. "high_standards" (Ishaan, 24): High standards, loves witty banter, sarcastic, loves being challenged.

Task:
1. Rate the User's latest message. Calculate a "rizzScore" (0 to 100).
2. Assign a "rizzRating" ('Spicy' | 'Sweet' | 'Safe' | 'Dry' | 'Awkward').
3. Provide constructive wingman "feedback" (max 30 words) on how to improve.
4. Generate the persona's next realistic "personaReply" in character based on the conversation history and userMessage.

Output MUST be strict JSON matching this exact structure:
{"rizzScore": 85, "rizzRating": "Spicy", "feedback": "...", "personaReply": "..."}`;

const userPrompt = `Dating Persona Selected: "over_flirty"
Conversation History So Far:
Persona: "Haha you're so sweet! What are you up to tonight? ✨"
User: "whats your plan"
Persona: "My plan? Well, it just got a whole lot more interesting now that you asked! 😉 Maybe it involves you and a spontaneous adventure? What do you say?"
User's Latest Message: "mai kuch nhi kehna chahti kya tum hindi mai bol skte ho"

Generate the JSON evaluation. Ensure the personaReply is 100% in-character.`;

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2500,
      responseMimeType: "application/json",
      thinkingConfig: {
        thinkingBudget: 0
      }
    }
  })
})
.then(res => res.json().then(data => {
  console.log("Status Code:", res.status);
  console.log("Response Body:", JSON.stringify(data, null, 2));
}))
.catch(err => {
  console.error("Error:", err);
});
