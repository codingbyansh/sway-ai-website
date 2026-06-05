const fs = require('fs');
async function test() {
    const token = "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";
    try {
        const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/Llama-3.2-11B-Vision-Instruct",
                messages: [
                    {
                        role: "user",
                        content: "Hello"
                    }
                ],
                max_tokens: 100
            })
        });
        console.log(await res.json());
    } catch (e) { console.error(e); }
}
test();
