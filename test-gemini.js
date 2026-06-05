const apiKey = "AQ.Ab8RN6ITUPFeQ5oY-hYQvBAkWuh34d1C3LJ_juruR4YTgNSBiQ";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [
      {
        parts: [{ text: "Hello, reply in one word." }]
      }
    ]
  })
})
.then(res => res.json().then(data => {
  console.log("Status Code:", res.status);
  console.log("Response Body:", JSON.stringify(data, null, 2));
}))
.catch(err => {
  console.error("Error:", err);
});
