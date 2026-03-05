import { useState } from 'react'
import API_URL from '../config'

function QuerySuggest({ onSuggestion, t }) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!question.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.query) {
        onSuggestion(data.query)
        setQuestion('')
      }
    } catch (err) {
      setError('Failed to get suggestion. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const exampleQuestions = [
    t.showAllUsers,
    t.postsWithMostViews,
    t.commentsByEachUser,
    t.postsWithTags
  ]

  return (
    <div className="query-suggest">
      <div className="suggest-header">
        <span className="suggest-icon">💬</span>
        <h3>{t.askInPlainEnglish}</h3>
      </div>

      <form onSubmit={handleSubmit} className="suggest-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t.askPlaceholder}
          className="suggest-input"
          disabled={loading}
        />
        <button
          type="submit"
          className="suggest-btn"
          disabled={loading || !question.trim()}
        >
          {loading ? (
            <span className="spinner small"></span>
          ) : (
            '✨'
          )}
        </button>
      </form>

      <div className="example-questions">
        {exampleQuestions.map((q, i) => (
          <button
            key={i}
            className="example-q-btn"
            onClick={() => setQuestion(q)}
            disabled={loading}
          >
            {q}
          </button>
        ))}
      </div>

      {error && (
        <div className="suggest-error">{error}</div>
      )}
    </div>
  )
}

export default QuerySuggest
