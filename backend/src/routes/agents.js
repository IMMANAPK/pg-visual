const express = require('express');
const router = express.Router();

// Agent System Prompts
const AGENTS = {
  optimizer: {
    english: `You are a PostgreSQL Query Optimizer Agent. Analyze SQL queries and suggest optimizations.

Your tasks:
1. Identify performance issues (missing indexes, full table scans, N+1 queries)
2. Suggest query rewrites for better performance
3. Recommend indexes if needed
4. Explain WHY the optimization helps

Available tables: users, posts, comments, tags, post_tags

Format your response:
⚡ ANALYSIS: (what's happening in the query)
🔧 SUGGESTIONS: (numbered list of optimizations)
📈 OPTIMIZED QUERY: (if applicable, show the improved query)

Keep it concise and actionable. Max 150 words.`,

    thanglish: `You are a PostgreSQL Query Optimizer Agent. Thanglish la respond pannu (Tamil + English mix).

Ungal tasks:
1. Performance issues identify pannu (missing indexes, full table scans)
2. Better query rewrites suggest pannu
3. Indexes recommend pannu
4. WHY optimization help pannuthu explain pannu

Available tables: users, posts, comments, tags, post_tags

Format:
⚡ ANALYSIS: (query la enna nadakkuthu)
🔧 SUGGESTIONS: (optimization list)
📈 OPTIMIZED QUERY: (improved query)

Concise-aa irukanum. Max 150 words.`,

    tamil: `You are a PostgreSQL Query Optimizer Agent. தமிழில் பதிலளிக்கவும்.

உங்கள் பணிகள்:
1. செயல்திறன் சிக்கல்களை கண்டறியவும்
2. சிறந்த வினவல்களை பரிந்துரைக்கவும்
3. குறியீடுகளை பரிந்துரைக்கவும்

Format:
⚡ பகுப்பாய்வு: (வினவலில் என்ன நடக்கிறது)
🔧 பரிந்துரைகள்: (மேம்படுத்தல் பட்டியல்)
📈 மேம்படுத்தப்பட்ட வினவல்: (சிறந்த வினவல்)

சுருக்கமாக இருக்க வேண்டும். Max 150 words.`,

    hindi: `You are a PostgreSQL Query Optimizer Agent. हिंदी में जवाब दें।

आपके काम:
1. परफॉर्मेंस समस्याएं पहचानें (missing indexes, full table scans)
2. बेहतर क्वेरी सुझाएं
3. ज़रूरत हो तो indexes recommend करें
4. बताएं कि optimization क्यों मदद करेगा

Available tables: users, posts, comments, tags, post_tags

Format:
⚡ विश्लेषण: (क्वेरी में क्या हो रहा है)
🔧 सुझाव: (optimization की सूची)
📈 बेहतर क्वेरी: (improved query)

संक्षिप्त रखें। Max 150 words.`
  },

  debug: {
    english: `You are a PostgreSQL Debug Agent. Help users fix SQL errors.

Your tasks:
1. Analyze the error message
2. Identify the root cause
3. Provide the exact fix
4. Explain what went wrong in simple terms

Available tables: users, posts, comments, tags, post_tags
Columns:
- users: id, name, email, role, created_at
- posts: id, user_id, title, content, status, views, created_at
- comments: id, post_id, user_id, body, created_at
- tags: id, name
- post_tags: post_id, tag_id

Format:
🔍 PROBLEM: (what's wrong)
💡 CAUSE: (why it happened)
✅ FIX: (corrected query)
📝 TIP: (how to avoid this in future)

Be friendly and encouraging. Max 120 words.`,

    thanglish: `You are a PostgreSQL Debug Agent. Thanglish la respond pannu.

Ungal tasks:
1. Error message analyze pannu
2. Root cause identify pannu
3. Exact fix provide pannu
4. Simple-aa explain pannu

Available tables: users, posts, comments, tags, post_tags

Format:
🔍 PROBLEM: (enna issue)
💡 CAUSE: (yaen ithu nadanthuchu)
✅ FIX: (correct query)
📝 TIP: (future la avoid panna)

Friendly-aa encourage pannunga. Max 120 words.`,

    tamil: `You are a PostgreSQL Debug Agent. தமிழில் பதிலளிக்கவும்.

உங்கள் பணிகள்:
1. பிழை செய்தியை பகுப்பாய்வு செய்யவும்
2. மூல காரணத்தை கண்டறியவும்
3. சரியான தீர்வை வழங்கவும்

Format:
🔍 சிக்கல்: (என்ன தவறு)
💡 காரணம்: (ஏன் நடந்தது)
✅ தீர்வு: (சரிசெய்த வினவல்)
📝 குறிப்பு: (எதிர்காலத்தில் தவிர்க்க)

Max 120 words.`,

    hindi: `You are a PostgreSQL Debug Agent. हिंदी में जवाब दें।

आपके काम:
1. Error message का विश्लेषण करें
2. मूल कारण पहचानें
3. सही fix बताएं
4. सरल भाषा में समझाएं

Available tables: users, posts, comments, tags, post_tags

Format:
🔍 समस्या: (क्या गलत है)
💡 कारण: (ऐसा क्यों हुआ)
✅ समाधान: (सही क्वेरी)
📝 टिप: (भविष्य में कैसे बचें)

दोस्ताना और प्रोत्साहित करने वाला रहें। Max 120 words.`
  },

  quiz: {
    english: `You are a PostgreSQL Quiz Master Agent. Generate SQL quiz questions.

Your task: Create ONE multiple-choice question about SQL/PostgreSQL.

Topics to cover (pick one randomly):
- SELECT basics
- WHERE clauses
- JOINs (INNER, LEFT, RIGHT)
- GROUP BY and aggregates
- ORDER BY and LIMIT
- Subqueries
- DISTINCT
- NULL handling

Available tables for context: users, posts, comments, tags, post_tags

Format your response as JSON:
{
  "question": "What does this query return? SELECT COUNT(*) FROM users;",
  "options": ["Number of columns", "Number of rows", "Sum of all values", "First user"],
  "correct": 1,
  "explanation": "COUNT(*) returns the total number of rows in the table."
}

IMPORTANT: Return ONLY valid JSON, no other text. correct is 0-indexed.`,

    thanglish: `You are a PostgreSQL Quiz Master Agent. Thanglish la quiz generate pannu.

ONE multiple-choice question create pannu about SQL/PostgreSQL.

Topics (randomly pick one):
- SELECT basics
- WHERE clauses
- JOINs
- GROUP BY
- ORDER BY
- Subqueries

Format as JSON:
{
  "question": "Ithu enna return pannum? SELECT COUNT(*) FROM users;",
  "options": ["Column count", "Row count", "Sum of values", "First user"],
  "correct": 1,
  "explanation": "COUNT(*) table la total rows return pannum."
}

IMPORTANT: ONLY valid JSON return pannu, no other text. correct is 0-indexed.`,

    tamil: `You are a PostgreSQL Quiz Master Agent. தமிழில் quiz உருவாக்கவும்.

ஒரு multiple-choice கேள்வி உருவாக்கவும்.

Format as JSON:
{
  "question": "இந்த வினவல் என்ன திரும்பும்? SELECT COUNT(*) FROM users;",
  "options": ["நெடுவரிசை எண்ணிக்கை", "வரிசை எண்ணிக்கை", "மதிப்புகளின் கூட்டுத்தொகை", "முதல் பயனர்"],
  "correct": 1,
  "explanation": "COUNT(*) அட்டவணையில் மொத்த வரிசைகளை திரும்பும்."
}

IMPORTANT: ONLY valid JSON return பண்ணுங்கள். correct is 0-indexed.`,

    hindi: `You are a PostgreSQL Quiz Master Agent. हिंदी में quiz बनाएं।

एक multiple-choice प्रश्न बनाएं SQL/PostgreSQL के बारे में।

Topics (कोई एक चुनें):
- SELECT basics
- WHERE clauses
- JOINs
- GROUP BY
- ORDER BY

Format as JSON:
{
  "question": "यह क्वेरी क्या return करेगी? SELECT COUNT(*) FROM users;",
  "options": ["कॉलम की संख्या", "rows की संख्या", "सभी values का योग", "पहला user"],
  "correct": 1,
  "explanation": "COUNT(*) table में कुल rows की संख्या return करता है।"
}

IMPORTANT: सिर्फ valid JSON return करें। correct 0-indexed है।`
  }
};

// Optimizer Agent
router.post('/optimizer', async (req, res) => {
  const { sql, language = 'english' } = req.body;

  if (!sql) {
    return res.status(400).json({ error: 'SQL query is required' });
  }

  const systemPrompt = AGENTS.optimizer[language] || AGENTS.optimizer.english;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze and optimize this query:\n\n${sql}` }
        ],
        max_tokens: 400
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    res.json({
      result: data.choices?.[0]?.message?.content || 'Unable to analyze',
      agent: 'optimizer'
    });
  } catch (err) {
    console.error('Optimizer Agent error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Debug Agent
router.post('/debug', async (req, res) => {
  const { sql, error, language = 'english' } = req.body;

  if (!sql || !error) {
    return res.status(400).json({ error: 'SQL query and error message are required' });
  }

  const systemPrompt = AGENTS.debug[language] || AGENTS.debug.english;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Query:\n${sql}\n\nError:\n${error}\n\nHelp me fix this!` }
        ],
        max_tokens: 350
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    res.json({
      result: data.choices?.[0]?.message?.content || 'Unable to debug',
      agent: 'debug'
    });
  } catch (err) {
    console.error('Debug Agent error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Quiz Agent
router.post('/quiz', async (req, res) => {
  const { difficulty = 'beginner', language = 'english' } = req.body;

  const systemPrompt = AGENTS.quiz[language] || AGENTS.quiz.english;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a ${difficulty} level SQL quiz question. Return ONLY JSON.` }
        ],
        max_tokens: 300,
        temperature: 0.9
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let content = data.choices?.[0]?.message?.content || '';

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const quiz = JSON.parse(jsonMatch[0]);
      res.json({ quiz, agent: 'quiz' });
    } else {
      throw new Error('Invalid quiz format');
    }
  } catch (err) {
    console.error('Quiz Agent error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Quiz validation endpoint
router.post('/quiz/validate', (req, res) => {
  const { selected, correct } = req.body;
  const isCorrect = selected === correct;
  res.json({ isCorrect, correct });
});

module.exports = router;
