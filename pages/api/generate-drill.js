import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { level, skills, mustSees } = req.body;

  if (!level || !Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are a certified swim instructor creating fun, safe drills for ${level}.
Skills to teach: ${skills.join(', ')}
Must include: ${mustSees.join(', ')}

For each skill, suggest ONE engaging drill.
Format: "🎯 Drill Name: Explanation"
Do not repeat drills.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const drills = text.split('\n').filter(line => line.trim() !== '');

    res.status(200).json({ drills });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'Failed to generate drill' });
  }
}