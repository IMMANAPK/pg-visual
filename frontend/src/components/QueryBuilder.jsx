import { useState, useEffect } from 'react'

function QueryBuilder({ schema, onBuildQuery, t }) {
  const [selectedTable, setSelectedTable] = useState('')
  const [selectedColumns, setSelectedColumns] = useState([])
  const [whereConditions, setWhereConditions] = useState([])
  const [joinTables, setJoinTables] = useState([])
  const [orderBy, setOrderBy] = useState({ column: '', direction: 'ASC' })
  const [limit, setLimit] = useState('')
  const [generatedSQL, setGeneratedSQL] = useState('')

  const tables = Object.keys(schema)

  // Generate SQL whenever state changes
  useEffect(() => {
    generateSQL()
  }, [selectedTable, selectedColumns, whereConditions, joinTables, orderBy, limit])

  const generateSQL = () => {
    if (!selectedTable) {
      setGeneratedSQL('')
      return
    }

    let sql = 'SELECT '

    // Columns
    if (selectedColumns.length === 0) {
      sql += '*'
    } else {
      sql += selectedColumns.map(c => {
        if (c.table && c.table !== selectedTable) {
          return `${c.table}.${c.name}`
        }
        return c.name
      }).join(', ')
    }

    // FROM
    sql += `\nFROM ${selectedTable}`

    // JOINs
    joinTables.forEach(join => {
      sql += `\n${join.type} JOIN ${join.table} ON ${selectedTable}.${join.fromCol} = ${join.table}.${join.toCol}`
    })

    // WHERE
    if (whereConditions.length > 0) {
      const validConditions = whereConditions.filter(c => c.column && c.value)
      if (validConditions.length > 0) {
        sql += '\nWHERE '
        sql += validConditions.map((c, i) => {
          const prefix = i > 0 ? ` ${c.logic || 'AND'} ` : ''
          const value = isNaN(c.value) ? `'${c.value}'` : c.value
          return `${prefix}${c.column} ${c.operator} ${value}`
        }).join('')
      }
    }

    // ORDER BY
    if (orderBy.column) {
      sql += `\nORDER BY ${orderBy.column} ${orderBy.direction}`
    }

    // LIMIT
    if (limit) {
      sql += `\nLIMIT ${limit}`
    }

    sql += ';'
    setGeneratedSQL(sql)
  }

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName)
    setSelectedColumns([])
    setWhereConditions([])
    setJoinTables([])
    setOrderBy({ column: '', direction: 'ASC' })
  }

  const toggleColumn = (column) => {
    setSelectedColumns(prev => {
      const exists = prev.find(c => c.name === column.name && c.table === (column.table || selectedTable))
      if (exists) {
        return prev.filter(c => !(c.name === column.name && c.table === (column.table || selectedTable)))
      }
      return [...prev, { ...column, table: column.table || selectedTable }]
    })
  }

  const addWhereCondition = () => {
    setWhereConditions(prev => [...prev, {
      column: '',
      operator: '=',
      value: '',
      logic: 'AND'
    }])
  }

  const updateWhereCondition = (index, field, value) => {
    setWhereConditions(prev => prev.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    ))
  }

  const removeWhereCondition = (index) => {
    setWhereConditions(prev => prev.filter((_, i) => i !== index))
  }

  const addJoin = () => {
    setJoinTables(prev => [...prev, {
      table: '',
      type: 'INNER',
      fromCol: '',
      toCol: 'id'
    }])
  }

  const updateJoin = (index, field, value) => {
    setJoinTables(prev => prev.map((j, i) =>
      i === index ? { ...j, [field]: value } : j
    ))
  }

  const removeJoin = (index) => {
    setJoinTables(prev => prev.filter((_, i) => i !== index))
  }

  const handleUseQuery = () => {
    if (generatedSQL && onBuildQuery) {
      onBuildQuery(generatedSQL)
    }
  }

  const getColumnsForTable = (tableName) => {
    return schema[tableName] || []
  }

  const getAllColumns = () => {
    let columns = [...getColumnsForTable(selectedTable).map(c => ({ ...c, table: selectedTable }))]
    joinTables.forEach(join => {
      if (join.table) {
        columns = [...columns, ...getColumnsForTable(join.table).map(c => ({ ...c, table: join.table }))]
      }
    })
    return columns
  }

  return (
    <div className="query-builder">
      <div className="qb-header">
        <span className="qb-icon">🔧</span>
        <h3>{t?.queryBuilder || 'Visual Query Builder'}</h3>
      </div>

      <div className="qb-content">
        {/* Step 1: Select Table */}
        <div className="qb-section">
          <label className="qb-label">
            <span className="step-number">1</span>
            {t?.selectTable || 'Select Table'}
          </label>
          <div className="qb-table-grid">
            {tables.map(table => (
              <button
                key={table}
                className={`qb-table-btn ${selectedTable === table ? 'selected' : ''}`}
                onClick={() => handleTableSelect(table)}
              >
                📋 {table}
              </button>
            ))}
          </div>
        </div>

        {selectedTable && (
          <>
            {/* Step 2: Select Columns */}
            <div className="qb-section">
              <label className="qb-label">
                <span className="step-number">2</span>
                {t?.selectColumns || 'Select Columns'}
                <span className="hint">({t?.clickToSelect || 'click to select'})</span>
              </label>
              <div className="qb-columns-grid">
                {getColumnsForTable(selectedTable).map((col, idx) => (
                  <button
                    key={idx}
                    className={`qb-column-btn ${selectedColumns.find(c => c.name === col.name && c.table === selectedTable) ? 'selected' : ''}`}
                    onClick={() => toggleColumn(col)}
                  >
                    {col.isPrimaryKey && <span className="pk">🔑</span>}
                    {col.isForeignKey && <span className="fk">🔗</span>}
                    {col.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Add JOINs */}
            <div className="qb-section">
              <label className="qb-label">
                <span className="step-number">3</span>
                {t?.addJoins || 'Add JOINs'}
                <button className="add-btn-small" onClick={addJoin}>+ Add</button>
              </label>
              {joinTables.map((join, idx) => (
                <div key={idx} className="qb-join-row">
                  <select
                    value={join.type}
                    onChange={(e) => updateJoin(idx, 'type', e.target.value)}
                    className="qb-select small"
                  >
                    <option value="INNER">INNER JOIN</option>
                    <option value="LEFT">LEFT JOIN</option>
                    <option value="RIGHT">RIGHT JOIN</option>
                  </select>
                  <select
                    value={join.table}
                    onChange={(e) => updateJoin(idx, 'table', e.target.value)}
                    className="qb-select"
                  >
                    <option value="">{t?.selectTable || 'Select table'}</option>
                    {tables.filter(t => t !== selectedTable).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="join-on">ON</span>
                  <select
                    value={join.fromCol}
                    onChange={(e) => updateJoin(idx, 'fromCol', e.target.value)}
                    className="qb-select"
                  >
                    <option value="">column</option>
                    {getColumnsForTable(selectedTable).map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <span>=</span>
                  <select
                    value={join.toCol}
                    onChange={(e) => updateJoin(idx, 'toCol', e.target.value)}
                    className="qb-select"
                  >
                    <option value="">column</option>
                    {join.table && getColumnsForTable(join.table).map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <button className="remove-btn" onClick={() => removeJoin(idx)}>✕</button>
                </div>
              ))}
            </div>

            {/* Step 4: WHERE Conditions */}
            <div className="qb-section">
              <label className="qb-label">
                <span className="step-number">4</span>
                {t?.whereConditions || 'WHERE Conditions'}
                <button className="add-btn-small" onClick={addWhereCondition}>+ Add</button>
              </label>
              {whereConditions.map((cond, idx) => (
                <div key={idx} className="qb-where-row">
                  {idx > 0 && (
                    <select
                      value={cond.logic}
                      onChange={(e) => updateWhereCondition(idx, 'logic', e.target.value)}
                      className="qb-select tiny"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  )}
                  <select
                    value={cond.column}
                    onChange={(e) => updateWhereCondition(idx, 'column', e.target.value)}
                    className="qb-select"
                  >
                    <option value="">column</option>
                    {getAllColumns().map((c, i) => (
                      <option key={i} value={c.table ? `${c.table}.${c.name}` : c.name}>
                        {c.table ? `${c.table}.${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={cond.operator}
                    onChange={(e) => updateWhereCondition(idx, 'operator', e.target.value)}
                    className="qb-select tiny"
                  >
                    <option value="=">=</option>
                    <option value="!=">!=</option>
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<=">&lt;=</option>
                    <option value="LIKE">LIKE</option>
                    <option value="IN">IN</option>
                  </select>
                  <input
                    type="text"
                    value={cond.value}
                    onChange={(e) => updateWhereCondition(idx, 'value', e.target.value)}
                    placeholder="value"
                    className="qb-input"
                  />
                  <button className="remove-btn" onClick={() => removeWhereCondition(idx)}>✕</button>
                </div>
              ))}
            </div>

            {/* Step 5: ORDER BY & LIMIT */}
            <div className="qb-section">
              <label className="qb-label">
                <span className="step-number">5</span>
                {t?.orderAndLimit || 'ORDER BY & LIMIT'}
              </label>
              <div className="qb-order-row">
                <select
                  value={orderBy.column}
                  onChange={(e) => setOrderBy(prev => ({ ...prev, column: e.target.value }))}
                  className="qb-select"
                >
                  <option value="">{t?.orderBy || 'Order by...'}</option>
                  {getAllColumns().map((c, i) => (
                    <option key={i} value={c.table ? `${c.table}.${c.name}` : c.name}>
                      {c.table ? `${c.table}.${c.name}` : c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={orderBy.direction}
                  onChange={(e) => setOrderBy(prev => ({ ...prev, direction: e.target.value }))}
                  className="qb-select tiny"
                >
                  <option value="ASC">ASC ↑</option>
                  <option value="DESC">DESC ↓</option>
                </select>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="LIMIT"
                  className="qb-input small"
                  min="1"
                />
              </div>
            </div>
          </>
        )}

        {/* Generated SQL */}
        {generatedSQL && (
          <div className="qb-preview">
            <label className="qb-label">
              <span className="step-number">✓</span>
              {t?.generatedSQL || 'Generated SQL'}
            </label>
            <pre className="qb-sql">{generatedSQL}</pre>
            <button className="qb-use-btn" onClick={handleUseQuery}>
              {t?.useThisQuery || 'Use This Query'} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QueryBuilder
