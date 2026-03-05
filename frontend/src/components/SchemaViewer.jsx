import { useState } from 'react'

function SchemaViewer({ schema, onTableClick, t }) {
  const [expandedTable, setExpandedTable] = useState(null)

  const toggleTable = (tableName) => {
    setExpandedTable(expandedTable === tableName ? null : tableName)
  }

  const tableCount = Object.keys(schema).length

  return (
    <div className="schema-viewer">
      <div className="schema-header">
        <span className="schema-icon">🗄️</span>
        <h3>{t.schema}</h3>
        <span className="table-count">{tableCount}</span>
      </div>

      <div className="tables-list">
        {Object.entries(schema).map(([tableName, columns]) => (
          <div key={tableName} className="table-card">
            <div
              className={`table-name ${expandedTable === tableName ? 'expanded' : ''}`}
              onClick={() => toggleTable(tableName)}
            >
              <span className="table-icon">📋</span>
              <span>{tableName}</span>
              <span className="column-count">{columns.length}</span>
              <span className="expand-icon">
                {expandedTable === tableName ? '▼' : '▶'}
              </span>
            </div>

            {expandedTable === tableName && (
              <div className="columns-list">
                {columns.map((col, index) => (
                  <div key={index} className="column-item">
                    <span className="column-name">
                      {col.isPrimaryKey && <span className="key-badge pk">🔑</span>}
                      {col.isForeignKey && <span className="key-badge fk">🔗</span>}
                      {col.name}
                    </span>
                    <span className="column-type">{col.type}</span>
                  </div>
                ))}
                <button
                  className="select-table-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTableClick(tableName)
                  }}
                >
                  {t.selectFrom} {tableName}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SchemaViewer
