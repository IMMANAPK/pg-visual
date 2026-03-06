import { useState, useRef, useEffect } from 'react'

function ERDiagram({ schema, onTableSelect, t }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [positions, setPositions] = useState({})
  const [dragging, setDragging] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  // Calculate initial positions in a grid layout
  useEffect(() => {
    const tables = Object.keys(schema)
    const cols = Math.ceil(Math.sqrt(tables.length))
    const initialPositions = {}

    tables.forEach((table, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      initialPositions[table] = {
        x: 50 + col * 220,
        y: 50 + row * 200
      }
    })

    setPositions(initialPositions)
  }, [schema])

  // Find relationships between tables
  const getRelationships = () => {
    const relationships = []

    Object.entries(schema).forEach(([tableName, columns]) => {
      columns.forEach(col => {
        if (col.isForeignKey) {
          // Try to find the referenced table
          const colNameLower = col.name.toLowerCase()

          // Common patterns: user_id -> users, post_id -> posts
          let refTable = null
          if (colNameLower.endsWith('_id')) {
            const baseName = colNameLower.replace('_id', '')
            // Try plural form
            const pluralName = baseName + 's'
            if (schema[pluralName]) refTable = pluralName
            else if (schema[baseName]) refTable = baseName
          }

          if (refTable) {
            relationships.push({
              from: tableName,
              to: refTable,
              fromCol: col.name,
              toCol: 'id',
              type: 'many-to-one'
            })
          }
        }
      })
    })

    return relationships
  }

  // Draw relationships on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || Object.keys(positions).length === 0) return

    const ctx = canvas.getContext('2d')
    const container = containerRef.current

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    const relationships = getRelationships()

    relationships.forEach(rel => {
      const fromPos = positions[rel.from]
      const toPos = positions[rel.to]

      if (!fromPos || !toPos) return

      // Calculate connection points
      const fromX = fromPos.x + 100 // Right side of table
      const fromY = fromPos.y + 60
      const toX = toPos.x // Left side of table
      const toY = toPos.y + 60

      // Draw curved line
      ctx.beginPath()
      ctx.moveTo(fromX, fromY)

      const midX = (fromX + toX) / 2
      ctx.bezierCurveTo(midX, fromY, midX, toY, toX, toY)

      ctx.strokeStyle = '#58a6ff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw arrow at end
      const angle = Math.atan2(toY - fromY, toX - midX)
      ctx.beginPath()
      ctx.moveTo(toX, toY)
      ctx.lineTo(toX - 10 * Math.cos(angle - Math.PI / 6), toY - 10 * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(toX - 10 * Math.cos(angle + Math.PI / 6), toY - 10 * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fillStyle = '#58a6ff'
      ctx.fill()

      // Draw relationship type indicator (crow's foot for many)
      ctx.beginPath()
      ctx.moveTo(fromX, fromY - 8)
      ctx.lineTo(fromX + 12, fromY)
      ctx.lineTo(fromX, fromY + 8)
      ctx.strokeStyle = '#58a6ff'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    ctx.restore()
  }, [positions, schema, zoom, pan])

  const handleMouseDown = (e, tableName) => {
    e.stopPropagation()
    setDragging(tableName)
    setSelectedTable(tableName)
  }

  const handleMouseMove = (e) => {
    if (!dragging) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    setPositions(prev => ({
      ...prev,
      [dragging]: {
        x: (e.clientX - rect.left - pan.x) / zoom - 100,
        y: (e.clientY - rect.top - pan.y) / zoom - 20
      }
    }))
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  const handleTableClick = (tableName) => {
    setSelectedTable(tableName)
    if (onTableSelect) {
      onTableSelect(tableName)
    }
  }

  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)))
  }

  return (
    <div className="erd-container">
      <div className="erd-header">
        <span className="erd-icon">🗺️</span>
        <h3>{t?.erdTitle || 'Schema Diagram'}</h3>
        <div className="erd-controls">
          <button onClick={() => handleZoom(-0.1)} title="Zoom Out">−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => handleZoom(0.1)} title="Zoom In">+</button>
        </div>
      </div>

      <div
        className="erd-canvas-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} className="erd-canvas" />

        {Object.entries(schema).map(([tableName, columns]) => (
          <div
            key={tableName}
            className={`erd-table ${selectedTable === tableName ? 'selected' : ''} ${dragging === tableName ? 'dragging' : ''}`}
            style={{
              left: (positions[tableName]?.x || 0) * zoom + pan.x,
              top: (positions[tableName]?.y || 0) * zoom + pan.y,
              transform: `scale(${zoom})`
            }}
            onMouseDown={(e) => handleMouseDown(e, tableName)}
            onClick={() => handleTableClick(tableName)}
          >
            <div className="erd-table-header">
              <span className="table-icon">📋</span>
              {tableName}
            </div>
            <div className="erd-table-columns">
              {columns.slice(0, 6).map((col, idx) => (
                <div key={idx} className="erd-column">
                  <span className="col-badges">
                    {col.isPrimaryKey && <span className="pk-badge">PK</span>}
                    {col.isForeignKey && <span className="fk-badge">FK</span>}
                  </span>
                  <span className="col-name">{col.name}</span>
                  <span className="col-type">{col.type}</span>
                </div>
              ))}
              {columns.length > 6 && (
                <div className="erd-column more">
                  +{columns.length - 6} more...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="erd-legend">
        <div className="legend-item">
          <span className="pk-badge">PK</span> Primary Key
        </div>
        <div className="legend-item">
          <span className="fk-badge">FK</span> Foreign Key
        </div>
        <div className="legend-item">
          <span className="rel-line">→</span> Relationship
        </div>
      </div>
    </div>
  )
}

export default ERDiagram
