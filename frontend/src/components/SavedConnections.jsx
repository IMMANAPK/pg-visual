import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API_URL from '../config'

function SavedConnections({ onConnect, activeConnectionId, t }) {
  const { token } = useAuth()
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newConn, setNewConn] = useState({ name: '', connectionString: '', isDefault: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [connecting, setConnecting] = useState(null)

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      const response = await fetch(`${API_URL}/api/connections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setConnections(data.connections || [])
    } catch (err) {
      console.error('Failed to fetch connections:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const response = await fetch(`${API_URL}/api/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          connectionName: newConn.name,
          connectionString: newConn.connectionString,
          isDefault: newConn.isDefault
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save connection')
      }

      setConnections([data.connection, ...connections])
      setNewConn({ name: '', connectionString: '', isDefault: false })
      setShowAddForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleConnect = async (connection) => {
    setConnecting(connection.id)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/connections/${connection.id}/connect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect')
      }

      onConnect(data.schema, data.database, data.connectionId, data.connectionName)
    } catch (err) {
      setError(err.message)
    } finally {
      setConnecting(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(t?.confirmDelete || 'Delete this connection?')) return

    try {
      await fetch(`${API_URL}/api/connections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setConnections(connections.filter(c => c.id !== id))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  if (loading) {
    return (
      <div className="saved-connections">
        <div className="section-header">
          <span className="section-icon">💾</span>
          <h3>{t?.savedConnections || 'Saved Connections'}</h3>
        </div>
        <div className="loading-text">Loading...</div>
      </div>
    )
  }

  return (
    <div className="saved-connections">
      <div className="section-header">
        <span className="section-icon">💾</span>
        <h3>{t?.savedConnections || 'Saved Connections'}</h3>
        <button
          className="add-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          title={t?.addConnection || 'Add Connection'}
        >
          {showAddForm ? '✕' : '+'}
        </button>
      </div>

      {error && (
        <div className="connection-error">
          <span>❌</span> {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAdd} className="add-connection-form">
          <input
            type="text"
            placeholder={t?.connectionName || 'Connection name'}
            value={newConn.name}
            onChange={(e) => setNewConn({ ...newConn, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="postgresql://user:pass@host:5432/db"
            value={newConn.connectionString}
            onChange={(e) => setNewConn({ ...newConn, connectionString: e.target.value })}
            required
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={newConn.isDefault}
              onChange={(e) => setNewConn({ ...newConn, isDefault: e.target.checked })}
            />
            {t?.setAsDefault || 'Set as default'}
          </label>
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? (
              <><span className="spinner small"></span> Saving...</>
            ) : (
              t?.saveConnection || 'Save Connection'
            )}
          </button>
        </form>
      )}

      <div className="connections-list">
        {connections.length === 0 ? (
          <div className="empty-state small">
            <span>📭</span>
            <p>{t?.noSavedConnections || 'No saved connections yet'}</p>
          </div>
        ) : (
          connections.map(conn => (
            <div
              key={conn.id}
              className={`connection-item ${activeConnectionId === conn.id ? 'active' : ''}`}
            >
              <div className="connection-info">
                <span className="connection-name">
                  {conn.is_default && <span className="default-badge">★</span>}
                  {conn.connection_name}
                </span>
                <span className="connection-db">{conn.database_name}</span>
              </div>
              <div className="connection-actions">
                <button
                  className="connect-btn small"
                  onClick={() => handleConnect(conn)}
                  disabled={connecting === conn.id}
                >
                  {connecting === conn.id ? (
                    <span className="spinner small"></span>
                  ) : activeConnectionId === conn.id ? (
                    '✓'
                  ) : (
                    '→'
                  )}
                </button>
                <button
                  className="delete-btn small"
                  onClick={() => handleDelete(conn.id)}
                  title={t?.delete || 'Delete'}
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SavedConnections
