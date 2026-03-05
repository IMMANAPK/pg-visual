# 🐘 PG Visual — PostgreSQL Visual Learning Portal

> Learn PostgreSQL visually — built for frontend devs

A full-stack PostgreSQL learning platform designed specifically for frontend developers transitioning to backend/database skills. Features AI-powered explanations, multi-language support, and interactive learning agents.

---

## ✨ Features

### Core Features
- **SQL Playground** — Write and execute SELECT queries with syntax highlighting
- **Animated Results** — Table rows slide in with staggered animations
- **AI Explanations** — Groq-powered explanations in frontend-dev friendly language
- **Schema Viewer** — Visual table structure with PK/FK badges
- **Query History** — Last 10 queries saved in localStorage

### Advanced Features
- **🌐 Multi-Language Support** — English, Thanglish, Tamil (தமிழ்), Hindi (हिंदी)
- **💬 Natural Language to SQL** — Ask questions in any supported language, get SQL queries
- **🤖 Multi-Agent System** — 4 specialized AI agents for different learning needs
- **🔌 Custom Database Connection** — Connect your own PostgreSQL database to learn with your own schema

---

## 🤖 AI Agents

| Agent | Icon | Purpose |
|-------|------|---------|
| **Tutor** | 🎓 | Explains queries in simple, visual terms with JS analogies |
| **Optimizer** | ⚡ | Analyzes query performance and suggests improvements |
| **Debug** | 🔧 | Helps fix SQL errors with detailed explanations |
| **Quiz** | 🧠 | Generates SQL quiz questions to test your knowledge |

---

## 🏗️ Tech Stack

```
Frontend  → React + Vite (JavaScript)
Backend   → Express.js + Node.js
Database  → PostgreSQL (via 'pg' npm package)
AI        → Groq API (llama-3.3-70b-versatile)
Styling   → Plain CSS (Dark theme with neon accents)
```

---

## 📁 Project Structure

```
pg-visual/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express app entry
│   │   ├── db.js                 # PostgreSQL pool connection
│   │   └── routes/
│   │       ├── query.js          # POST /api/query
│   │       ├── explain.js        # POST /api/explain (AI)
│   │       ├── suggest.js        # POST /api/suggest (NL to SQL)
│   │       ├── agents.js         # POST /api/agents/:type
│   │       └── database.js       # Custom DB connection
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── translations.js       # i18n translations
│   │   ├── components/
│   │   │   ├── Playground.jsx
│   │   │   ├── ResultTable.jsx
│   │   │   ├── AIExplainer.jsx
│   │   │   ├── SchemaViewer.jsx
│   │   │   ├── QueryHistory.jsx
│   │   │   ├── QuerySuggest.jsx
│   │   │   ├── DatabaseConnect.jsx
│   │   │   └── agents/
│   │   │       ├── OptimizerAgent.jsx
│   │   │       ├── DebugAgent.jsx
│   │   │       └── QuizAgent.jsx
│   │   └── styles/
│   │       └── main.css
│   └── package.json
│
├── database/
│   └── seed.sql
├── CLAUDE.md                     # Original project plan
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL installed and running

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create database (using pgAdmin or psql)
CREATE DATABASE pgvisual;

# Run seed file
psql -U postgres -d pgvisual -f database/seed.sql
```

Or run in pgAdmin Query Tool:
```sql
-- Copy contents of database/seed.sql and execute
```

### 3. Configure Environment

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/pgvisual
GROQ_API_KEY=gsk_your_groq_api_key
PORT=4000
```

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Open Browser

Navigate to: **http://localhost:5173**

---

## 🌐 Language Support

The entire UI supports 4 languages:

| Language | Code | Example |
|----------|------|---------|
| English | `english` | "Show all users" |
| Thanglish | `thanglish` | "Ella users um kaattu" |
| Tamil | `tamil` | "எல்லா பயனர்களையும் காட்டு" |
| Hindi | `hindi` | "सभी उपयोगकर्ता दिखाओ" |

**Natural Language Queries work in all languages!**

---

## 🔌 Custom Database Connection

Connect your own PostgreSQL database:

1. Click **"Connect DB"** button in header
2. Enter your connection string:
   ```
   postgresql://user:password@host:5432/database
   ```
3. Your schema will be automatically detected
4. Run queries on your own data!

**Security Notes:**
- Only SELECT queries are allowed
- Connection strings are not stored
- Each session is isolated

---

## 📡 API Endpoints

### Query Execution
```
POST /api/query
Body: { sql: "SELECT * FROM users" }
Response: { rows: [...], rowCount: 5, duration: 12 }
```

### AI Explanation
```
POST /api/explain
Body: { sql: "...", result: [...], language: "english" }
Response: { explanation: "..." }
```

### Natural Language to SQL
```
POST /api/suggest
Body: { question: "Show all published posts", language: "english", schema: {...} }
Response: { sql: "SELECT * FROM posts WHERE status = 'published'" }
```

### AI Agents
```
POST /api/agents/optimizer
POST /api/agents/debug
POST /api/agents/quiz
Body: { sql: "...", error: "...", difficulty: "easy", language: "english", schema: {...} }
```

### Custom Database
```
POST /api/database/connect
POST /api/database/disconnect
POST /api/database/query
GET  /api/database/schema/:sessionId
GET  /api/database/status/:sessionId
```

---

## 🎨 UI Design

- **Theme:** Dark mode with neon cyan/purple accents
- **Font:** JetBrains Mono (code), Inter (UI)
- **Animations:**
  - Table rows slide in with staggered delay
  - Typewriter effect for AI explanations
  - Pulse animation for active states
- **Layout:** 3-panel (sidebar, center, AI panel)

---

## 🗄️ Sample Database Schema

```
users (id, name, email, role, created_at)
  ↓
posts (id, user_id, title, content, status, views, created_at)
  ↓
comments (id, post_id, user_id, body, created_at)

tags (id, name)
  ↓
post_tags (post_id, tag_id)
```

---

## ✅ Completed Features

- [x] SQL Playground with syntax highlighting
- [x] Animated result tables
- [x] AI-powered query explanations (Groq)
- [x] Schema viewer with PK/FK badges
- [x] Query history with localStorage
- [x] Natural language to SQL conversion
- [x] Multi-language support (EN/Thanglish/Tamil/Hindi)
- [x] Full website translation
- [x] Multi-agent system (Tutor/Optimizer/Debug/Quiz)
- [x] Custom database connection
- [x] Dynamic schema detection
- [x] Session management
- [x] Security (SELECT-only queries)

---

## 🛠️ Development

```bash
# Backend hot reload
cd backend && npm run dev

# Frontend hot reload
cd frontend && npm run dev

# Check API health
curl http://localhost:4000/api/health
```

---

## 📝 License

MIT License - Built with ❤️ for frontend developers learning PostgreSQL

---

## 🙏 Credits

- **AI:** Groq API with Llama 3.3 70B
- **Database:** PostgreSQL
- **Icons:** Native emoji
- **Design Inspiration:** VS Code + Figma aesthetic
