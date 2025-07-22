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
    
    // ✅ Use correct model name
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest" 
    });

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
    
    // Clean up response into array
    const drills = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('Sure!'));

    res.status(200).json({ drills });
  } catch (error) {
    console.error('Gemini Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate drill', 
      details: error.message 
    });
  }
}