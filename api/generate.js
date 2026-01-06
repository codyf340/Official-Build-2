export default async function handler(req, res) {
  const { prompt } = req.body;
  const API_KEY = process.env.API_KEY; // Vercel pulls this from your Settings

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}
