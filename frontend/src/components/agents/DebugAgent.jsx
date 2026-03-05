import { useState, useEffect } from 'react'
import API_URL from '../../config'

function DebugAgent({ sql, error: queryError, language, t }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const debugQuery = async () => {
    if (!sql?.trim() || !queryError) {
      setError(t.noErrorToDebug)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/api/agents/debug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, error: queryError, language })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data.result)
      }
    } catch (err) {
      setError('Failed to debug query')
    } finally {
      setLoading(false)
    }
  }

  // Auto-debug when there's an error
  useEffect(() => {
    if (queryError && sql) {
      debugQuery()
    }
  }, [queryError])

  return (
    <div className="agent-debug">
      <div className="agent-header">
        <span className="agent-icon">🔧</span>
        <h3>{t.debugAgent}</h3>
      </div>

      <p className="agent-description">{t.debugDescription}</p>

      {queryError ? (
        <div className="debug-error-box">
          <span className="error-label">{t.currentError}:</span>
          <code>{queryError}</code>
        </div>
      ) : (
        <div className="no-error-box">
          <span>✅</span> {t.noErrors}
        </div>
      )}

      <button
        className="agent-action-btn debug-btn"
        onClick={debugQuery}
        disabled={loading || !queryError}
      >
        {loading ? (
          <>
            <span className="spinner small"></span>
            {t.debugging}
          </>
        ) : (
          <>
            🔧 {t.fixError}
          </>
        )}
      </button>

      {error && (
        <div className="agent-error">
          <span>❌</span> {error}
        </div>
      )}

      {result && (
        <div className="agent-result debug-result">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  )
}

export default DebugAgent
