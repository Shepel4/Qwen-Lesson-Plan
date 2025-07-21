// pages/api/generate-drill.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { level, skills, mustSees } = req.body;

  if (!level || !Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const prompt = `
You are a certified swim instructor creating fun, safe drills for ${level}.
Skills to teach: ${skills.join(', ')}
Must include: ${mustSees.join(', ')}

For each skill, suggest ONE engaging drill.
Format: "🎯 Drill Name: Explanation"
Do not repeat drills.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 500,
    });

    const text = completion.choices[0].message.content;
    const drills = text.split('\n').filter(line => line.trim() !== '');

    res.status(200).json({ drills });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Failed to generate drill' });
  }
}
