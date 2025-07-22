import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { level, skills } = req.body;

  if (!level || !Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    // Embedded Lifesaving Society Alberta Must-Sees & Principles
    const mustSeePrinciples = `
Lifesaving Society Alberta - Key Teaching Principles:
• Always supervise children around water
• Use PFDs when appropriate
• Teach Water Smart messages each class (e.g., "Swim with a Buddy", "Within Arms’ Reach")
• Emphasize safety first: no diving in shallow water
• Encourage fun, confidence, and play-based learning
• Progress skills gradually based on individual readiness
• Ensure all entries/exits are controlled and safe
• Promote breath control and submersion comfort
• Reinforce buoyancy awareness and body position`;

    const prompt = `
You are a certified swim instructor following the Life Saving Society Alberta Swim for Life program.
Create one engaging, safe, age-appropriate drill for each skill below for ${level}.

Skills to teach:
${skills.join('\n')}

${mustSeePrinciples}

For each skill:
• Suggest exactly ONE drill
• Include: Drill Name, How to Do It, Equipment Needed
• Format: "🎯 [Drill Name]: [Description]. Equipment: [list]"
• Do NOT include markdown, quotes, or extra text
• Do NOT repeat drills
• Keep language clear, practical, and fun for young swimmers`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean and parse response
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && (line.startsWith('🎯') || line.match(/^[A-Z]/)))
      .slice(0, skills.length); // Match number of skills

    // Fallback if AI returns too few results
    const fallbackDrills = [];
    for (let i = 0; i < skills.length; i++) {
      if (lines[i]) {
        fallbackDrills.push(lines[i]);
      } else {
        const action = skills[i].split(' ')[0].toLowerCase();
        fallbackDrills.push(
          `🎯 Practice Time: Guide swimmers through ${action}-based repetition. Equipment: Instructor support, pool edge`
        );
      }
    }

    res.status(200).json({ drills: fallbackDrills });
  } catch (error) {
    console.error('Gemini Error:', error.message);
    const fallback = skills.map(skill => {
      const action = skill.split(' ')[0].toLowerCase();
      return `🎯 Skill Builder: Focus on ${action} with guided practice. Equipment: Pool edge, visual cues`;
    });
    res.status(500).json({ error: 'Failed to generate drill', drills: fallback });
  }
}