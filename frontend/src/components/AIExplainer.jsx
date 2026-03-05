import { useState, useEffect } from 'react'

function AIExplainer({ explanation, loading, onExplainAgain, t }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!explanation) {
      setDisplayedText('')
      return
    }

    setIsTyping(true)
    setDisplayedText('')

    let index = 0
    const interval = setInterval(() => {
      if (index < explanation.length) {
        setDisplayedText(explanation.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 15)

    return () => clearInterval(interval)
  }, [explanation])

  return (
    <div className="ai-explainer">
      <div className="ai-header">
        <span className="ai-icon">🤖</span>
        <h3>{t.aiExplanation}</h3>
      </div>

      <div className="ai-content">
        {loading ? (
          <div className="ai-loading">
            <div className="ai-skeleton">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line medium"></div>
            </div>
            <p className="loading-text">{t.analyzingQuery}</p>
          </div>
        ) : displayedText ? (
          <div className="ai-text">
            {displayedText}
            {isTyping && <span className="cursor">|</span>}
          </div>
        ) : (
          <div className="ai-empty">
            <p>{t.runQueryForExplanation}</p>
            <p className="ai-hint">{t.aiHint}</p>
          </div>
        )}
      </div>

      {explanation && !loading && (
        <button className="explain-again-btn" onClick={onExplainAgain}>
          🔄 {t.explainAgain}
        </button>
      )}
    </div>
  )
}

export default AIExplainer
