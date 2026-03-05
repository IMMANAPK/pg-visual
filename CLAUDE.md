# PG Visual — PostgreSQL Learning Portal for Frontend Developers
## Claude CLI Build Prompt

---

## 🎯 Project Overview

Build a full-stack **PostgreSQL Visual Learning Portal** targeted at **frontend developers** who are learning backend/database skills. The app must feel visual, animated, and approachable — not dry or academic.

**Name:** PG Visual  
**Tagline:** "Learn PostgreSQL visually — built for frontend devs"

---

## 🏗️ Tech Stack

```
Frontend  → React + Vite (TypeScript optional, JS is fine)
Backend   → Express.js + Node.js
Database  → PostgreSQL (via 'pg' npm package)
AI        → Anthropic Claude API (claude-sonnet-4-20250514)
Styling   → Plain CSS or Tailwind (no component libraries)
```

---

## 📁 Folder Structure to Create

```
pg-visual/
├── backend/
│   ├── src/
│   │   ├── index.js           # Express app entry
│   │   ├── db.js              # PostgreSQL pool connection
│   │   ├── routes/
│   │   │   ├── query.js       # POST /api/query — run SQL
│   │   │   └── explain.js     # POST /api/explain — AI explain
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Playground.jsx      # SQL editor + run button
│   │   │   ├── ResultTable.jsx     # Animated result table
│   │   │   ├── AIExplainer.jsx     # AI explanation panel
│   │   │   ├── SchemaViewer.jsx    # Visual table schema cards
│   │   │   └── QueryHistory.jsx    # Past queries sidebar
│   │   ├── styles/
│   │   │   └── main.css
│   └── package.json
│
├── database/
│   └── seed.sql               # Sample DB with realistic data
└── README.md
```

---

## 🗄️ Database Setup

Create a sample database called `pgvisual` with these tables — use realistic data that a frontend developer would relate to:

```sql
-- seed.sql

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer',     -- admin | editor | viewer
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  status VARCHAR(20) DEFAULT 'draft',    -- draft | published | archived
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Seed realistic data
INSERT INTO users (name, email, role) VALUES
  ('Imman Dev', 'imman@pgvisual.dev', 'admin'),
  ('Priya Frontend', 'priya@pgvisual.dev', 'editor'),
  ('Raj Fullstack', 'raj@pgvisual.dev', 'editor'),
  ('Sara Designer', 'sara@pgvisual.dev', 'viewer'),
  ('Karthik Backend', 'karthik@pgvisual.dev', 'viewer');

INSERT INTO posts (user_id, title, status, views) VALUES
  (1, 'Getting started with React hooks', 'published', 1240),
  (1, 'PostgreSQL for frontend devs', 'published', 890),
  (2, 'CSS Grid complete guide', 'published', 2100),
  (2, 'TypeScript tips and tricks', 'draft', 0),
  (3, 'Node.js performance tuning', 'published', 450),
  (3, 'REST vs GraphQL', 'archived', 320),
  (4, 'Figma to React workflow', 'published', 780),
  (1, 'Building a design system', 'draft', 0);

INSERT INTO comments (post_id, user_id, body) VALUES
  (1, 2, 'Great article! Really helped me understand hooks.'),
  (1, 3, 'Can you cover useCallback next?'),
  (2, 4, 'Finally a DB article for frontend devs!'),
  (3, 1, 'The grid examples are super clear.'),
  (5, 2, 'Bookmarked this for later.');

INSERT INTO tags (name) VALUES
  ('react'), ('postgresql'), ('css'), ('typescript'),
  ('nodejs'), ('performance'), ('beginners');

INSERT INTO post_tags VALUES
  (1, 1), (1, 7),
  (2, 2), (2, 7),
  (3, 3),
  (4, 4),
  (5, 5), (5, 6);
```

---

## ⚙️ Backend Implementation

### `backend/src/index.js`
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const queryRoutes = require('./routes/query');
const explainRoutes = require('./routes/explain');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/query', queryRoutes);
app.use('/api/explain', explainRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log('🚀 PG Visual backend running on port 4000');
});
```

### `backend/src/db.js`
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
```

### `backend/src/routes/query.js`
- POST `/api/query` — accepts `{ sql: string }`
- Validates: only allow SELECT statements (block DROP, DELETE, INSERT, UPDATE for safety in the playground)
- Runs the query against the `pgvisual` database using `pg` Pool
- Returns `{ rows: [...], fields: [...], rowCount: number, duration: number }`
- On error: returns `{ error: string }` with status 400
- Track query duration using `Date.now()` before and after

### `backend/src/routes/explain.js`
- POST `/api/explain` — accepts `{ sql: string, result: array }`
- Calls Anthropic Claude API (`claude-sonnet-4-20250514`)
- System prompt: "You are a friendly PostgreSQL tutor for frontend developers. Explain SQL queries in simple, visual terms. Use analogies that frontend devs understand (like comparing JOINs to merging arrays, WHERE to .filter(), GROUP BY to .reduce()). Keep explanations under 100 words. Be encouraging."
- User message: `Explain this SQL query: ${sql}\n\nIt returned ${result.length} rows.`
- Returns `{ explanation: string }`
- Use the Anthropic SDK: `npm install @anthropic-ai/sdk`

### `backend/.env`
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/pgvisual
ANTHROPIC_API_KEY=your_key_here
PORT=4000
```

---

## 🎨 Frontend Implementation

### Design Direction
- **Dark theme** — deep navy/dark bg, neon green/cyan accents
- **Font** — JetBrains Mono for code, Inter or similar for UI
- **Aesthetic** — VS Code meets Figma — clean, developer-friendly
- **Animations** — table rows slide in one by one when results appear
- **Layout** — 3-panel: left sidebar (schema + history), center (editor), right (AI panel)

### `frontend/src/App.jsx`
3-panel layout:
```
┌─────────────────────────────────────────────────┐
│  PG Visual         🐘 pgvisual database          │
├──────────┬──────────────────────┬────────────────┤
│  SCHEMA  │   SQL PLAYGROUND     │  AI EXPLAINER  │
│          │                      │                │
│ users    │  SELECT * FROM...    │  💡 This query  │
│ posts    │                      │  works like    │
│ comments │  [▶ Run Query]       │  .filter() in  │
│ tags     │                      │  JavaScript!   │
│──────────│  RESULTS             │                │
│ HISTORY  │  ┌──┬──────┬──────┐  │                │
│          │  │id│name  │email │  │                │
│ query 1  │  ├──┼──────┼──────┤  │                │
│ query 2  │  │1 │Imman │...   │  │                │
└──────────┴──────────────────────┴────────────────┘
```

### `frontend/src/components/Playground.jsx`
- Textarea for SQL input (monospace font, syntax highlight with basic color coding)
- "▶ Run Query" button — calls `POST /api/query`
- Show loading spinner while query runs
- Show query duration (e.g., "Returned 5 rows in 12ms")
- On success → pass results to ResultTable + trigger AI explain
- On error → show red error message with the PostgreSQL error
- Include 5 example query buttons that pre-fill the editor:
  1. `SELECT * FROM users;`
  2. `SELECT title, views FROM posts WHERE status = 'published' ORDER BY views DESC;`
  3. `SELECT users.name, COUNT(posts.id) as post_count FROM users LEFT JOIN posts ON users.id = posts.user_id GROUP BY users.name;`
  4. `SELECT posts.title, tags.name as tag FROM posts INNER JOIN post_tags ON posts.id = post_tags.post_id INNER JOIN tags ON post_tags.tag_id = tags.id;`
  5. `SELECT status, COUNT(*) as total, SUM(views) as total_views FROM posts GROUP BY status;`

### `frontend/src/components/ResultTable.jsx`
- Display query results in a clean table
- **Animation**: each row fades + slides in with staggered delay (50ms per row)
- Column headers in accent color
- Row count badge at top ("5 rows")
- Duration badge ("12ms")
- If 0 rows: show friendly empty state "No rows returned 🤷"
- If error: show styled error card in red

### `frontend/src/components/AIExplainer.jsx`
- Right panel
- Shows a loading skeleton when fetching explanation
- Displays explanation text with typewriter animation (character by character)
- Small "🤖 AI Explanation" header
- "Explain again" button to re-trigger
- Style: dark card with subtle blue border

### `frontend/src/components/SchemaViewer.jsx`
- Left panel top section
- Show all 5 tables as clickable cards: users, posts, comments, tags, post_tags
- Click a table → show its columns with types (hardcode the schema from seed.sql)
- Visual badge for PRIMARY KEY (🔑), FOREIGN KEY (🔗), and data types
- Clicking a table name auto-fills `SELECT * FROM {table} LIMIT 10;` in the editor

### `frontend/src/components/QueryHistory.jsx`
- Left panel bottom section
- Store last 10 queries in localStorage
- Each entry shows: first 40 chars of query + row count
- Click → re-populate editor
- "Clear" button at bottom

---

## 🚀 Setup Instructions to Include in README

```markdown
# PG Visual — Setup

## Prerequisites
- Node.js 18+
- PostgreSQL running locally

## Backend Setup
cd backend
npm install
# Create .env file with your DATABASE_URL and ANTHROPIC_API_KEY
npm run dev

## Database Setup
psql -U postgres -c "CREATE DATABASE pgvisual;"
psql -U postgres -d pgvisual -f database/seed.sql

## Frontend Setup
cd frontend
npm install
npm run dev

## Open
http://localhost:5173
```

---

## ✅ Definition of Done

The project is complete when:
- [x] User can type any SELECT query and see animated results
- [x] AI explains the query in frontend-dev friendly language
- [x] Schema viewer shows all tables and columns
- [x] 5 example queries work out of the box
- [x] Query history saves and restores
- [x] Error states are handled gracefully
- [x] App looks polished (dark theme, animations)

### Additional Features Completed:
- [x] Natural language to SQL conversion (Ask questions, get SQL)
- [x] Multi-language support (English, Thanglish, Tamil, Hindi)
- [x] Full website translation for all supported languages
- [x] Multi-agent system:
  - [x] Tutor Agent (explains queries)
  - [x] Optimizer Agent (performance suggestions)
  - [x] Debug Agent (error fixing help)
  - [x] Quiz Agent (SQL quiz questions)
- [x] Custom database connection (connect your own PostgreSQL)
- [x] Dynamic schema detection from connected database
- [x] Session management for database connections
- [x] Security: SELECT-only queries allowed

### Tech Updates:
- Changed from Anthropic Claude API to **Groq API** (llama-3.3-70b-versatile)
- Added i18n translations system
- Added agent routing system

---

## 🎯 Important Notes for Claude CLI

1. **Create ALL files** — don't skip any file listed in the folder structure
2. **Working code only** — no placeholder comments like "add logic here"
3. **Backend first** — create backend files before frontend
4. **Test the SQL route** — make sure the query validation regex properly blocks non-SELECT statements
5. **CSS in separate file** — put all styles in `frontend/src/styles/main.css`
6. **No TypeScript** — keep it plain JavaScript for speed
7. **package.json scripts** — backend should have `"dev": "nodemon src/index.js"`, frontend uses Vite default
8. After creating all files, print a summary of what was created and the setup steps