const express = require('express');
const router = express.Router();

const PROMPTS = {
  english: `You are a friendly PostgreSQL tutor for frontend developers. Explain SQL queries in simple, visual terms. Use analogies that frontend devs understand (like comparing JOINs to merging arrays, WHERE to .filter(), GROUP BY to .reduce()). Keep explanations under 100 words. Be encouraging.`,

  thanglish: `You are a friendly PostgreSQL tutor. Explain SQL queries in Thanglish (Tamil + English mix, written in English script). Use casual, conversational tone like talking to a friend. Example style: "Ithu oru simple SELECT query - users table la irundhu ellaa rows-um fetch pannum. WHERE clause use panna, JavaScript la .filter() maari work aagum." Keep explanations under 100 words. Be encouraging and fun!`,

  tamil: `You are a friendly PostgreSQL tutor. Explain SQL queries in Tamil (written in Tamil script). Use simple, easy-to-understand Tamil. Compare SQL concepts to everyday examples. Example: "இது ஒரு SELECT query - users table-ல இருந்து எல்லா rows-ஐயும் எடுக்கும்." Keep explanations under 100 words. Be encouraging!`,

  hindi: `You are a friendly PostgreSQL tutor. Explain SQL queries in Hindi (written in Devanagari script). Use simple, easy-to-understand Hindi. Compare SQL concepts to JavaScript examples that frontend devs understand. Example style: "यह एक SELECT query है - users table से सभी rows लाएगी। WHERE clause JavaScript के .filter() जैसा काम करता है।" Keep explanations under 100 words. Be encouraging and friendly!`
};

router.post('/', async (req, res) => {
  const { sql, result, language = 'english' } = req.body;

  if (!sql) {
    return res.status(400).json({
      error: 'SQL query is required for explanation'
    });
  }

  const rowCount = Array.isArray(result) ? result.length : 0;
  const systemPrompt = PROMPTS[language] || PROMPTS.english;

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
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Explain this SQL query:\n\n${sql}\n\nIt returned ${rowCount} rows.`
          }
        ],
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Groq API error');
    }

    const explanation = data.choices?.[0]?.message?.content || 'Unable to generate explanation';

    res.json({ explanation });
  } catch (err) {
    console.error('Groq API error:', err.message);
    res.status(500).json({
      error: 'Failed to generate AI explanation',
      details: err.message
    });
  }
});

module.exports = router;
