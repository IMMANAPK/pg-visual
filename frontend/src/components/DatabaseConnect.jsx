import { useState } from 'react'
import API_URL from '../config'

function DatabaseConnect({ onConnect, onDisconnect, isConnected, connectedDb, t }) {
  const [showModal, setShowModal] = useState(false)
  const [connectionString, setConnectionString] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleConnect = async () => {
    if (!connectionString.trim()) {
      setError(t.connectionStringRequired)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const sessionId = localStorage.getItem('pgvisual-session') ||
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('pgvisual-session', sessionId)

      const response = await fetch(`${API_URL}/api/database/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString, sessionId })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.details || data.error)
      } else {
        onConnect(data.schema, data.database, sessionId)
        setShowModal(false)
        setConnectionString('')
      }
    } catch (err) {
      setError(t.connectionFailed)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    const sessionId = localStorage.getItem('pgvisual-session')

    try {
      await fetch(`${API_URL}/api/database/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
    } catch (err) {
      console.error('Disconnect error:', err)
    }

    localStorage.removeItem('pgvisual-session')
    onDisconnect()
  }

  const handleUseSample = () => {
    onDisconnect()
    setShowModal(false)
  }

  return (
    <>
      <button
        className={`db-connect-btn ${isConnected ? 'connected' : ''}`}
        onClick={() => setShowModal(true)}
      >
        {isConnected ? (
          <>
            <span className="connect-icon">🔗</span>
            <span className="connect-text">{connectedDb}</span>
          </>
        ) : (
          <>
            <span className="connect-icon">🔌</span>
            <span className="connect-text">{t.connectDb}</span>
          </>
        )}
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.connectDatabase}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <p className="modal-description">{t.connectDescription}</p>

              <div className="connection-options">
                <div className="option-card sample" onClick={handleUseSample}>
                  <span className="option-icon">🎓</span>
                  <div className="option-info">
                    <h3>{t.useSampleDb}</h3>
                    <p>{t.sampleDbDescription}</p>
                  </div>
                  {!isConnected && <span className="option-badge">{t.current}</span>}
                </div>

                <div className="option-divider">
                  <span>{t.or}</span>
                </div>

                <div className="option-card custom">
                  <span className="option-icon">🔧</span>
                  <div className="option-info">
                    <h3>{t.connectCustomDb}</h3>
                    <p>{t.customDbDescription}</p>
                  </div>
                </div>
              </div>

              <div className="connection-form">
                <label>{t.connectionString}</label>
                <input
                  type="text"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  placeholder="postgresql://user:password@host:5432/database"
                  className="connection-input"
                />
                <p className="connection-hint">{t.connectionHint}</p>

                {error && (
                  <div className="connection-error">
                    <span>❌</span> {error}
                  </div>
                )}

                <div className="connection-actions">
                  {isConnected && (
                    <button
                      className="disconnect-btn"
                      onClick={handleDisconnect}
                    >
                      {t.disconnect}
                    </button>
                  )}
                  <button
                    className="connect-btn"
                    onClick={handleConnect}
                    disabled={loading || !connectionString.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner small"></span>
                        {t.connecting}
                      </>
                    ) : (
                      t.connect
                    )}
                  </button>
                </div>
              </div>

              <div className="security-note">
                <span>🔒</span>
                <p>{t.securityNote}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DatabaseConnect
