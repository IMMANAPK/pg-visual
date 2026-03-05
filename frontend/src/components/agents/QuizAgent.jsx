import { useState } from 'react'
import API_URL from '../../config'

function QuizAgent({ language, t }) {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [difficulty, setDifficulty] = useState('beginner')

  const fetchQuiz = async () => {
    setLoading(true)
    setError(null)
    setQuiz(null)
    setSelected(null)
    setAnswered(false)

    try {
      const response = await fetch(`${API_URL}/api/agents/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty, language })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setQuiz(data.quiz)
      }
    } catch (err) {
      setError('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = () => {
    if (selected === null) return

    setAnswered(true)
    const isCorrect = selected === quiz.correct

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }))
  }

  const nextQuestion = () => {
    fetchQuiz()
  }

  return (
    <div className="agent-quiz">
      <div className="agent-header">
        <span className="agent-icon">🧠</span>
        <h3>{t.quizAgent}</h3>
      </div>

      <div className="quiz-score">
        <span className="score-label">{t.score}:</span>
        <span className="score-value">{score.correct}/{score.total}</span>
      </div>

      <div className="quiz-difficulty">
        <label>{t.difficulty}:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          disabled={loading}
        >
          <option value="beginner">{t.beginner}</option>
          <option value="intermediate">{t.intermediate}</option>
          <option value="advanced">{t.advanced}</option>
        </select>
      </div>

      {!quiz && !loading && (
        <button
          className="agent-action-btn quiz-btn"
          onClick={fetchQuiz}
        >
          🎯 {t.startQuiz}
        </button>
      )}

      {loading && (
        <div className="quiz-loading">
          <span className="spinner"></span>
          <p>{t.loadingQuiz}</p>
        </div>
      )}

      {error && (
        <div className="agent-error">
          <span>❌</span> {error}
          <button onClick={fetchQuiz} className="retry-btn">{t.retry}</button>
        </div>
      )}

      {quiz && !loading && (
        <div className="quiz-card">
          <div className="quiz-question">
            <span className="question-icon">❓</span>
            <p>{quiz.question}</p>
          </div>

          <div className="quiz-options">
            {quiz.options.map((option, index) => (
              <button
                key={index}
                className={`quiz-option ${selected === index ? 'selected' : ''} ${
                  answered
                    ? index === quiz.correct
                      ? 'correct'
                      : selected === index
                      ? 'wrong'
                      : ''
                    : ''
                }`}
                onClick={() => !answered && setSelected(index)}
                disabled={answered}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option}</span>
                {answered && index === quiz.correct && (
                  <span className="option-check">✓</span>
                )}
                {answered && selected === index && index !== quiz.correct && (
                  <span className="option-cross">✗</span>
                )}
              </button>
            ))}
          </div>

          {!answered ? (
            <button
              className="agent-action-btn submit-btn"
              onClick={submitAnswer}
              disabled={selected === null}
            >
              {t.submitAnswer}
            </button>
          ) : (
            <div className="quiz-result">
              <div className={`result-banner ${selected === quiz.correct ? 'correct' : 'wrong'}`}>
                {selected === quiz.correct ? (
                  <>🎉 {t.correct}!</>
                ) : (
                  <>😅 {t.incorrect}</>
                )}
              </div>
              <div className="explanation">
                <strong>{t.explanation}:</strong> {quiz.explanation}
              </div>
              <button
                className="agent-action-btn next-btn"
                onClick={nextQuestion}
              >
                {t.nextQuestion} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default QuizAgent
