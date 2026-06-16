const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const Review = require('../models/Review');
const router = express.Router();

const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql'
];

const buildPrompt = (code, language) => `
You are an expert code reviewer. Analyze the following ${language} code and return ONLY valid JSON (no markdown, no explanation outside JSON).

Code to review:
\`\`\`${language}
${code}
\`\`\`

Return this exact JSON structure:
{
  "summary": "2-3 sentence overall summary of the code quality",
  "score": <number 0-100>,
  "positives": ["what the code does well", "..."],
  "bugs": [
    {
      "severity": "critical|high|medium|low",
      "line": "line number or range e.g. '12' or '10-15'",
      "message": "description of the bug",
      "suggestion": "how to fix it"
    }
  ],
  "security": [
    {
      "severity": "critical|high|medium|low",
      "line": "line number or range",
      "message": "security issue description",
      "suggestion": "how to fix it"
    }
  ],
  "performance": [
    {
      "message": "performance issue description",
      "suggestion": "optimization suggestion"
    }
  ],
  "bestPractices": [
    {
      "message": "best practice violation",
      "suggestion": "recommended approach"
    }
  ]
}

Be specific, actionable, and accurate. If no issues found in a category, return an empty array.
`;

router.post('/', auth, async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required' });
    }
    if (code.length > 20000) {
      return res.status(400).json({ error: 'Code too long (max 20,000 characters)' });
    }
    const lang = (language || 'javascript').toLowerCase();
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return res.status(400).json({ error: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(', ')}` });
    }

    // Call Groq API
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: buildPrompt(code, lang) }],
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    const groqData = await groqRes.json();
    const rawText = groqData?.choices?.[0]?.message?.content;

    if (!rawText) {
      console.error('Groq response:', JSON.stringify(groqData));
      return res.status(500).json({ error: 'No response from AI' });
    }

    let reviewData;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      reviewData = JSON.parse(cleaned);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    const shareId = uuidv4().slice(0, 8);

    let savedReview = null;
    try {
      savedReview = await Review.create({
        shareId,
        userId: req.user?.id || null,
        code,
        language: lang,
        review: reviewData
      });
    } catch (dbErr) {
      console.warn('DB save skipped:', dbErr.message);
    }

    res.json({
      shareId,
      language: lang,
      review: reviewData,
      savedToHistory: !!savedReview
    });

  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: 'Review failed. Please try again.' });
  }
});

// Get shared review by ID
router.get('/share/:shareId', async (req, res) => {
  try {
    const review = await Review.findOne({ shareId: req.params.shareId }).select('-code');
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

module.exports = router;
