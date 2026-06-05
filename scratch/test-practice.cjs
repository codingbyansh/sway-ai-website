const token = "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";
const hfModel = "Qwen/Qwen2.5-72B-Instruct";
const apiKey = "AIzaSyAJELwvAFQthdgU_37_qVQ0ixhn9WqKGmQ";

const systemPrompt = `You are a relationship Wingman AI analyzing a practice chat session.
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
3. Provide constructive wingman "feedback" (max 30 words) on how to improve.
4. Generate the persona's next realistic "personaReply" in character based on the conversation history and userMessage.

Output MUST be strict JSON matching this exact structure:
{"rizzScore": 85, "rizzRating": "Spicy", "feedback": "...", "personaReply": "..."}`;

const userPrompt = `Dating Persona Selected: "bollywood_buff"
Conversation History So Far:
(No history yet)
User's Latest Message: "hii"

Generate the JSON evaluation. Ensure the personaReply is 100% in-character.`;

async function testHF() {
    try {
        const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: hfModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                max_tokens: 1500,
                temperature: 0.7
            })
        });
        const data = await res.json();
        console.log("HF Status:", res.status);
        console.log("HF Reply:", JSON.stringify(data));
    } catch (e) {
        console.error("HF Error:", e.message);
    }
}

async function testGemini() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
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
                    maxOutputTokens: 1500,
                    responseMimeType: "application/json"
                }
            })
        });
        const data = await res.json();
        console.log("Gemini Status:", res.status);
        console.log("Gemini Reply:", JSON.stringify(data));
    } catch (e) {
        console.error("Gemini Error:", e.message);
    }
}

async function main() {
    console.log("Testing Hugging Face Qwen...");
    await testHF();
    console.log("\nTesting Gemini...");
    await testGemini();
}

main();
