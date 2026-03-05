const express = require('express');
const router = express.Router();

const SYSTEM_PROMPT = `You are a PostgreSQL query generator. Convert natural language questions to SQL queries.
You understand questions in English, Tamil, Thanglish (Tamil-English mix), and Hindi.

Available tables and columns:
- users (id, name, email, role, created_at)
- posts (id, user_id, title, content, status, views, created_at)
- comments (id, post_id, user_id, body, created_at)
- tags (id, name)
- post_tags (post_id, tag_id)

Relationships:
- posts.user_id → users.id
- comments.post_id → posts.id
- comments.user_id → users.id
- post_tags.post_id → posts.id
- post_tags.tag_id → tags.id

Example questions you understand:
- "Show all users" (English)
- "Ellaa users-um kaattu" (Thanglish)
- "Published posts mattum vendum" (Thanglish)
- "எல்லா பயனர்களையும் காட்டு" (Tamil)
- "सभी यूज़र्स दिखाओ" (Hindi)
- "ज़्यादा views वाले posts" (Hindi)

Rules:
1. Return ONLY the SQL query, no explanations
2. Use proper JOINs when needed
3. Always use SELECT (read-only queries)
4. Keep queries simple and readable
5. Add LIMIT 10 for queries that might return many rows`;

router.post('/', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({
      error: 'Question is required'
    });
  }

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
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Groq API error');
    }

    let query = data.choices?.[0]?.message?.content || '';

    // Clean up the response - extract SQL if wrapped in code blocks
    query = query.replace(/```sql\n?/gi, '').replace(/```\n?/g, '').trim();

    res.json({ query });
  } catch (err) {
    console.error('Groq API error:', err.message);
    res.status(500).json({
      error: 'Failed to generate query suggestion',
      details: err.message
    });
  }
});

module.exports = router;
