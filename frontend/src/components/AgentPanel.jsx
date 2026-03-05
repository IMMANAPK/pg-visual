import { useState } from 'react'
import OptimizerAgent from './agents/OptimizerAgent'
import DebugAgent from './agents/DebugAgent'
import QuizAgent from './agents/QuizAgent'

function AgentPanel({ sql, error, language, t }) {
  const [activeAgent, setActiveAgent] = useState('tutor')

  const agents = [
    { id: 'tutor', icon: '🎓', label: t.tutorAgent },
    { id: 'optimizer', icon: '⚡', label: t.optimizerAgent },
    { id: 'debug', icon: '🔧', label: t.debugAgent },
    { id: 'quiz', icon: '🧠', label: t.quizAgent }
  ]

  return (
    <div className="agent-panel">
      <div className="agent-tabs">
        {agents.map(agent => (
          <button
            key={agent.id}
            className={`agent-tab ${activeAgent === agent.id ? 'active' : ''}`}
            onClick={() => setActiveAgent(agent.id)}
            title={agent.label}
          >
            <span className="agent-tab-icon">{agent.icon}</span>
            <span className="agent-tab-label">{agent.label}</span>
          </button>
        ))}
      </div>

      <div className="agent-content">
        {activeAgent === 'tutor' && (
          <div className="agent-placeholder">
            <p>{t.tutorDescription}</p>
          </div>
        )}

        {activeAgent === 'optimizer' && (
          <OptimizerAgent sql={sql} language={language} t={t} />
        )}

        {activeAgent === 'debug' && (
          <DebugAgent sql={sql} error={error} language={language} t={t} />
        )}

        {activeAgent === 'quiz' && (
          <QuizAgent language={language} t={t} />
        )}
      </div>
    </div>
  )
}

export default AgentPanel
