import { useState } from 'react'
import API_URL from '../../config'

function OptimizerAgent({ sql, language, t }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyzeQuery = async () => {
    if (!sql?.trim()) {
      setError(t.noQueryToAnalyze)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/api/agents/optimizer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, language })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data.result)
      }
    } catch (err) {
      setError('Failed to analyze query')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="agent-optimizer">
      <div className="agent-header">
        <span className="agent-icon">⚡</span>
        <h3>{t.optimizerAgent}</h3>
      </div>

      <p className="agent-description">{t.optimizerDescription}</p>

      <button
        className="agent-action-btn optimizer-btn"
        onClick={analyzeQuery}
        disabled={loading || !sql?.trim()}
      >
        {loading ? (
          <>
            <span className="spinner small"></span>
            {t.analyzing}
          </>
        ) : (
          <>
            ⚡ {t.analyzeQuery}
          </>
        )}
      </button>

      {error && (
        <div className="agent-error">
          <span>❌</span> {error}
        </div>
      )}

      {result && (
        <div className="agent-result optimizer-result">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  )
}

export default OptimizerAgent
