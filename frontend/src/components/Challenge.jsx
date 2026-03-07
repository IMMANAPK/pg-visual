import { useState } from 'react'

function Challenge({ challenge, onComplete, onRunQuery, isCompleted, t }) {
  const [userQuery, setUserQuery] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const handleSubmit = () => {
    setAttempts(prev => prev + 1)

    // Check if query matches expected pattern
    if (challenge.expectedPattern.test(userQuery)) {
      setFeedback({
        type: 'success',
        message: t?.correctAnswer || '🎉 Correct! Well done!'
      })

      // Run the query to show results
      if (onRunQuery) {
        onRunQuery(userQuery)
      }

      // Mark as complete after a delay
      setTimeout(() => {
        onComplete(challenge.id, challenge.points)
      }, 1500)
    } else {
      setFeedback({
        type: 'error',
        message: t?.tryAgain || '❌ Not quite right. Try again!'
      })

      // Show hint after 2 failed attempts
      if (attempts >= 1) {
        setShowHint(true)
      }
    }
  }

  const handleRunInPlayground = () => {
    if (onRunQuery && userQuery.trim()) {
      onRunQuery(userQuery)
    }
  }

  return (
    <div className="challenge-view">
      <div className="challenge-header">
        <h4>{challenge.title}</h4>
        <div className="challenge-reward">
          <span className="points-badge">+{challenge.points} pts</span>
        </div>
      </div>

      <div className="challenge-task">
        <p><strong>📝 {t?.task || 'Task'}:</strong> {challenge.task}</p>
      </div>

      {showHint && (
        <div className="challenge-hint">
          <span className="hint-icon">💡</span>
          <p><strong>{t?.hint || 'Hint'}:</strong> {challenge.hint}</p>
        </div>
      )}

      <div className="challenge-editor">
        <label>{t?.yourQuery || 'Your Query'}:</label>
        <textarea
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="SELECT ..."
          className="challenge-textarea"
          rows={4}
          spellCheck={false}
        />
      </div>

      <div className="challenge-actions">
        <button
          className="challenge-btn secondary"
          onClick={handleRunInPlayground}
          disabled={!userQuery.trim()}
        >
          ▶️ {t?.testQuery || 'Test Query'}
        </button>
        <button
          className="challenge-btn primary"
          onClick={handleSubmit}
          disabled={!userQuery.trim() || isCompleted}
        >
          ✓ {t?.submitAnswer || 'Submit Answer'}
        </button>
      </div>

      {!showHint && !feedback && (
        <button
          className="hint-toggle"
          onClick={() => setShowHint(true)}
        >
          💡 {t?.needHint || 'Need a hint?'}
        </button>
      )}

      {feedback && (
        <div className={`challenge-feedback ${feedback.type}`}>
          <p>{feedback.message}</p>
          {feedback.type === 'success' && (
            <div className="success-animation">
              <span>🎯</span>
              <span>+{challenge.points}</span>
            </div>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="already-completed">
          <span>✅</span>
          <p>{t?.alreadyCompleted || 'You\'ve already completed this challenge!'}</p>
        </div>
      )}
    </div>
  )
}

export default Challenge
