function QueryHistory({ history, onHistoryClick, onClear, t }) {
  const truncate = (str, len = 40) => {
    if (str.length <= len) return str
    return str.slice(0, len) + '...'
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="query-history">
      <div className="history-header">
        <span className="history-icon">📜</span>
        <h3>{t.history}</h3>
        {history.length > 0 && (
          <button className="clear-btn" onClick={onClear}>
            {t.clear}
          </button>
        )}
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="history-empty">
            <p>{t.noQueriesYet}</p>
          </div>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              className="history-item"
              onClick={() => onHistoryClick(item.sql)}
            >
              <div className="history-query">{truncate(item.sql)}</div>
              <div className="history-meta">
                <span className="history-rows">{item.rowCount} {t.rows}</span>
                <span className="history-time">{formatTime(item.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default QueryHistory
