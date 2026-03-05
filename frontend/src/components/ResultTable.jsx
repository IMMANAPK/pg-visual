function ResultTable({ result, error, duration, loading, t }) {
  if (loading) {
    return (
      <div className="result-container">
        <div className="result-header">
          <h3>{t.results}</h3>
        </div>
        <div className="result-loading">
          <div className="loading-skeleton">
            <div className="skeleton-row"></div>
            <div className="skeleton-row"></div>
            <div className="skeleton-row"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="result-container">
        <div className="result-header">
          <h3>{t.results}</h3>
        </div>
        <div className="error-card">
          <span className="error-icon">❌</span>
          <div className="error-content">
            <strong>{t.queryError}</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="result-container">
        <div className="result-header">
          <h3>{t.results}</h3>
        </div>
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <p>{t.runQueryToSeeResults}</p>
        </div>
      </div>
    )
  }

  if (result.length === 0) {
    return (
      <div className="result-container">
        <div className="result-header">
          <h3>{t.results}</h3>
          <div className="result-badges">
            <span className="badge">0 {t.rows}</span>
            {duration !== null && <span className="badge">{duration}ms</span>}
          </div>
        </div>
        <div className="empty-state">
          <span className="empty-icon">🤷</span>
          <p>{t.noRowsReturned}</p>
        </div>
      </div>
    )
  }

  const columns = Object.keys(result[0])

  return (
    <div className="result-container">
      <div className="result-header">
        <h3>{t.results}</h3>
        <div className="result-badges">
          <span className="badge">{result.length} {t.rows}</span>
          {duration !== null && <span className="badge">{duration}ms</span>}
        </div>
      </div>
      <div className="table-wrapper">
        <table className="result-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="table-row"
                style={{ animationDelay: `${rowIndex * 50}ms` }}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {row[col] === null ? (
                      <span className="null-value">NULL</span>
                    ) : typeof row[col] === 'object' ? (
                      JSON.stringify(row[col])
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResultTable
