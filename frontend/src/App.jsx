import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Playground from './components/Playground'
import ResultTable from './components/ResultTable'
import AIExplainer from './components/AIExplainer'
import SchemaViewer from './components/SchemaViewer'
import QueryHistory from './components/QueryHistory'
import QuerySuggest from './components/QuerySuggest'
import DatabaseConnect from './components/DatabaseConnect'
import SavedConnections from './components/SavedConnections'
import UserMenu from './components/UserMenu'
import AuthPage from './components/auth/AuthPage'
import OptimizerAgent from './components/agents/OptimizerAgent'
import DebugAgent from './components/agents/DebugAgent'
import QuizAgent from './components/agents/QuizAgent'
import translations from './translations'
import API_URL from './config'

// Default sample schema
const defaultSchema = {
  users: [
    { name: 'id', type: 'SERIAL', isPrimaryKey: true },
    { name: 'name', type: 'VARCHAR(100)' },
    { name: 'email', type: 'VARCHAR(100)' },
    { name: 'role', type: 'VARCHAR(20)' },
    { name: 'created_at', type: 'TIMESTAMP' }
  ],
  posts: [
    { name: 'id', type: 'SERIAL', isPrimaryKey: true },
    { name: 'user_id', type: 'INTEGER', isForeignKey: true },
    { name: 'title', type: 'VARCHAR(255)' },
    { name: 'content', type: 'TEXT' },
    { name: 'status', type: 'VARCHAR(20)' },
    { name: 'views', type: 'INTEGER' },
    { name: 'created_at', type: 'TIMESTAMP' }
  ],
  comments: [
    { name: 'id', type: 'SERIAL', isPrimaryKey: true },
    { name: 'post_id', type: 'INTEGER', isForeignKey: true },
    { name: 'user_id', type: 'INTEGER', isForeignKey: true },
    { name: 'body', type: 'TEXT' },
    { name: 'created_at', type: 'TIMESTAMP' }
  ],
  tags: [
    { name: 'id', type: 'SERIAL', isPrimaryKey: true },
    { name: 'name', type: 'VARCHAR(50)' }
  ],
  post_tags: [
    { name: 'post_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true },
    { name: 'tag_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true }
  ]
}

function App() {
  const { user, token, loading: authLoading, isAuthenticated } = useAuth()

  const [sql, setSql] = useState('SELECT * FROM users;')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState(null)
  const [explanation, setExplanation] = useState('')
  const [explaining, setExplaining] = useState(false)
  const [activeAgent, setActiveAgent] = useState('tutor')
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('pgvisual-history')
    return saved ? JSON.parse(saved) : []
  })
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('pgvisual-language') || 'english'
  })

  // Custom database state
  const [isCustomDb, setIsCustomDb] = useState(false)
  const [customDbName, setCustomDbName] = useState('')
  const [connectionId, setConnectionId] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [schema, setSchema] = useState(defaultSchema)

  // Get current translations
  const t = translations[language] || translations.english

  // Use user's language setting if authenticated
  useEffect(() => {
    if (user?.settings?.language) {
      setLanguage(user.settings.language)
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('pgvisual-language', language)
  }, [language])

  useEffect(() => {
    localStorage.setItem('pgvisual-history', JSON.stringify(history))
  }, [history])

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('pgvisual-session')
    if (savedSession) {
      checkSession(savedSession)
    }
  }, [])

  const checkSession = async (sid) => {
    try {
      const response = await fetch(`${API_URL}/api/database/status/${sid}`)
      const data = await response.json()
      if (data.connected) {
        setSessionId(sid)
        setIsCustomDb(true)
        // Fetch schema
        const schemaRes = await fetch(`${API_URL}/api/database/schema/${sid}`)
        const schemaData = await schemaRes.json()
        if (schemaData.tables) {
          // Convert to our schema format
          const newSchema = {}
          for (const [table, columns] of Object.entries(schemaData.tables)) {
            newSchema[table] = columns.map(col => {
              const [name, type] = col.split(' (')
              return { name, type: type?.replace(')', '') || 'unknown' }
            })
          }
          setSchema(newSchema)
        }
      }
    } catch (err) {
      console.error('Session check failed:', err)
    }
  }

  const handleDbConnect = (newSchema, dbName, connId, connName) => {
    // Handle both old format (from DatabaseConnect) and new format (from SavedConnections)
    let formattedSchema = {}

    if (newSchema && typeof newSchema === 'object') {
      for (const [table, columns] of Object.entries(newSchema)) {
        if (Array.isArray(columns)) {
          formattedSchema[table] = columns.map(col => ({
            name: col.name || col,
            type: (col.type || 'unknown').toUpperCase(),
            isPrimaryKey: col.isPrimaryKey || false,
            isForeignKey: col.isForeignKey || false
          }))
        }
      }
    }

    setSchema(formattedSchema)
    setCustomDbName(connName || dbName)
    setConnectionId(connId)
    setSessionId(connId) // For backwards compatibility
    setIsCustomDb(true)
    setResult(null)
    setError(null)

    const firstTable = Object.keys(formattedSchema)[0]
    if (firstTable) {
      setSql(`SELECT * FROM ${firstTable} LIMIT 10;`)
    }
  }

  const handleDbDisconnect = () => {
    setSchema(defaultSchema)
    setCustomDbName('')
    setSessionId(null)
    setIsCustomDb(false)
    setResult(null)
    setError(null)
    setSql('SELECT * FROM users;')
  }

  const runQuery = async () => {
    if (!sql.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setExplanation('')

    try {
      let endpoint, body, headers = { 'Content-Type': 'application/json' }

      // Use authenticated connection endpoint if logged in and connected
      if (isAuthenticated && isCustomDb && connectionId) {
        endpoint = `${API_URL}/api/connections/query`
        body = { sql, connectionId }
        headers['Authorization'] = `Bearer ${token}`
      } else if (isCustomDb) {
        // Legacy: non-authenticated custom database
        endpoint = `${API_URL}/api/database/query`
        body = { sql, sessionId }
      } else {
        // Sample database
        endpoint = `${API_URL}/api/query`
        body = { sql }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setActiveAgent('debug')
      } else {
        setResult(data.rows)
        setDuration(data.duration)

        const newEntry = {
          sql: sql.trim(),
          rowCount: data.rowCount,
          timestamp: Date.now()
        }
        setHistory(prev => [newEntry, ...prev.slice(0, 9)])

        fetchExplanation(sql, data.rows)
      }
    } catch (err) {
      setError('Failed to connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const fetchExplanation = async (query, rows) => {
    setExplaining(true)
    try {
      // Build schema context for custom database
      let schemaContext = ''
      if (isCustomDb) {
        schemaContext = '\n\nAvailable tables:\n'
        for (const [table, columns] of Object.entries(schema)) {
          schemaContext += `- ${table}: ${columns.map(c => c.name).join(', ')}\n`
        }
      }

      const response = await fetch(`${API_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: query + schemaContext,
          result: rows,
          language
        })
      })

      const data = await response.json()
      if (data.explanation) {
        setExplanation(data.explanation)
      } else if (data.error) {
        setExplanation('Unable to generate explanation: ' + data.error)
      }
    } catch (err) {
      setExplanation('Failed to fetch AI explanation.')
    } finally {
      setExplaining(false)
    }
  }

  const handleTableClick = (tableName) => {
    setSql(`SELECT * FROM ${tableName} LIMIT 10;`)
  }

  const handleHistoryClick = (query) => {
    setSql(query)
  }

  const clearHistory = () => {
    setHistory([])
  }

  const agents = [
    { id: 'tutor', icon: '🎓', label: t.tutorAgent },
    { id: 'optimizer', icon: '⚡', label: t.optimizerAgent },
    { id: 'debug', icon: '🔧', label: t.debugAgent },
    { id: 'quiz', icon: '🧠', label: t.quizAgent }
  ]

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <span className="auth-logo">🐘</span>
          <div className="spinner" style={{ margin: '20px auto' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth page if not logged in
  if (!isAuthenticated) {
    return <AuthPage t={t} />
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🐘</span>
          <span className="logo-text">PG Visual</span>
        </div>
        <div className="tagline">{t.tagline}</div>
        <div className="language-selector">
          <span className="lang-label">🌐</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="lang-select"
          >
            <option value="english">English</option>
            <option value="thanglish">Thanglish</option>
            <option value="tamil">தமிழ்</option>
            <option value="hindi">हिंदी</option>
          </select>
        </div>
        <div className="db-badge">
          <span className={`db-dot ${isCustomDb ? 'custom' : ''}`}></span>
          {isCustomDb ? customDbName : t.sampleDb || 'Sample DB'}
        </div>
        <UserMenu t={t} />
      </header>

      <main className="main">
        <aside className="sidebar">
          <SchemaViewer
            schema={schema}
            onTableClick={handleTableClick}
            t={t}
          />
          <SavedConnections
            onConnect={handleDbConnect}
            activeConnectionId={connectionId}
            t={t}
          />
          <QueryHistory
            history={history}
            onHistoryClick={handleHistoryClick}
            onClear={clearHistory}
            t={t}
          />
        </aside>

        <section className="center">
          <QuerySuggest onSuggestion={setSql} t={t} schema={schema} />
          <Playground
            sql={sql}
            setSql={setSql}
            onRun={runQuery}
            loading={loading}
            t={t}
          />
          <ResultTable
            result={result}
            error={error}
            duration={duration}
            loading={loading}
            t={t}
          />
        </section>

        <aside className="ai-panel">
          <div className="agent-tabs">
            {agents.map(agent => (
              <button
                key={agent.id}
                className={`agent-tab ${activeAgent === agent.id ? 'active' : ''} ${
                  agent.id === 'debug' && error ? 'has-error' : ''
                }`}
                onClick={() => setActiveAgent(agent.id)}
                title={agent.label}
              >
                <span className="agent-tab-icon">{agent.icon}</span>
              </button>
            ))}
          </div>

          <div className="agent-content">
            {activeAgent === 'tutor' && (
              <AIExplainer
                explanation={explanation}
                loading={explaining}
                onExplainAgain={() => result && fetchExplanation(sql, result)}
                t={t}
              />
            )}

            {activeAgent === 'optimizer' && (
              <OptimizerAgent sql={sql} language={language} t={t} schema={schema} />
            )}

            {activeAgent === 'debug' && (
              <DebugAgent sql={sql} error={error} language={language} t={t} schema={schema} />
            )}

            {activeAgent === 'quiz' && (
              <QuizAgent language={language} t={t} />
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
