import { useState, useRef, useEffect, useCallback } from 'react'

// Layout constants
const TABLE_WIDTH = 200
const ROW_HEIGHT = 28
const HEADER_HEIGHT = 40
const H_GAP = 60
const V_GAP = 50
const CANVAS_PAD = 40

// Dynamic columns: scales with table count
function getGridCols(n) {
  if (n <= 3) return n
  if (n <= 8) return 3
  if (n <= 20) return 4
  if (n <= 40) return 5
  if (n <= 70) return 6
  return 7
}

// Compute zoom so all tables fit in the viewport
function getFitZoom(tableCount, schema, viewW, viewH) {
  const cols = getGridCols(tableCount)
  const rows = Math.ceil(tableCount / cols)
  const totalW = CANVAS_PAD * 2 + cols * TABLE_WIDTH + (cols - 1) * H_GAP
  const maxTableH = Math.max(...Object.values(schema).map(c => getTableHeight(c)))
  const totalH = CANVAS_PAD * 2 + rows * maxTableH + (rows - 1) * V_GAP
  const zoomX = (viewW || 1200) / totalW
  const zoomY = (viewH || 700) / totalH
  return Math.min(zoomX, zoomY, 1) // never zoom in beyond 100%
}

function getTableHeight(cols) {
  return HEADER_HEIGHT + Math.min(cols.length, 8) * ROW_HEIGHT + 8
}

function getInitialPositions(schema) {
  const tables = Object.keys(schema)
  const cols = getGridCols(tables.length)
  const positions = {}
  tables.forEach((name, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    positions[name] = {
      x: CANVAS_PAD + col * (TABLE_WIDTH + H_GAP),
      y: CANVAS_PAD + row * (getTableHeight(schema[name]) + V_GAP),
    }
  })
  return positions
}

function getRelationships(schema) {
  const rels = []
  Object.entries(schema).forEach(([tableName, columns]) => {
    columns.forEach(col => {
      if (col.isForeignKey && col.name.endsWith('_id')) {
        const base = col.name.replace('_id', '')
        const ref = schema[base + 's'] ? base + 's' : schema[base] ? base : null
        if (ref) rels.push({ from: tableName, to: ref, col: col.name })
      }
    })
  })
  return rels
}

// -------- SIDEBAR TRIGGER --------
function ERDiagram({ schema, onTableSelect, t }) {
  const [open, setOpen] = useState(false)

  const tableCount = Object.keys(schema).length

  return (
    <>
      <div className="erd-trigger-wrapper">
        <div className="erd-trigger-header">
          <span className="erd-trigger-icon">🗺️</span>
          <h3>{t?.erdTitle || 'Schema Diagram'}</h3>
          <span className="erd-trigger-badge">{tableCount}</span>
        </div>
        <p className="erd-trigger-desc">
          Visual diagram showing all tables and their relationships
        </p>
        <button className="erd-open-btn" onClick={() => setOpen(true)}>
          <span>Open ERD Diagram</span>
          <span className="erd-open-arrow">↗</span>
        </button>

        {/* Mini table list for quick query */}
        <div className="erd-mini-list">
          {Object.keys(schema).map(name => (
            <button
              key={name}
              className="erd-mini-item"
              onClick={() => onTableSelect && onTableSelect(name)}
            >
              <span className="erd-mini-icon">📋</span>
              <span className="erd-mini-name">{name}</span>
              <span className="erd-mini-count">{schema[name].length}</span>
            </button>
          ))}
        </div>
      </div>

      {open && (
        <ERDModal
          schema={schema}
          onTableSelect={onTableSelect}
          onClose={() => setOpen(false)}
          t={t}
        />
      )}
    </>
  )
}

// -------- FULL-SCREEN MODAL DIAGRAM --------
function ERDModal({ schema, onTableSelect, onClose, t }) {
  const svgRef = useRef(null)
  const canvasAreaRef = useRef(null)
  const [positions, setPositions] = useState(() => getInitialPositions(schema))
  const [selected, setSelected] = useState(null)
  const [zoom, setZoom] = useState(() => getFitZoom(Object.keys(schema).length, schema, 1200, 680))
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)
  const panRef = useRef(null)

  const relationships = getRelationships(schema)

  // ---- Table dragging ----
  const onTableMouseDown = useCallback((e, name) => {
    e.stopPropagation()
    setSelected(name)
    const startX = e.clientX
    const startY = e.clientY
    const startPos = { ...positions[name] }

    const onMove = (mv) => {
      const dx = (mv.clientX - startX) / zoom
      const dy = (mv.clientY - startY) / zoom
      setPositions(prev => ({
        ...prev,
        [name]: { x: startPos.x + dx, y: startPos.y + dy }
      }))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [positions, zoom])

  // ---- Canvas panning ----
  const onCanvasMouseDown = useCallback((e) => {
    if (e.target !== svgRef.current && e.target.tagName !== 'svg') return
    panRef.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y }
    const onMove = (mv) => {
      setPan({
        x: panRef.current.px + mv.clientX - panRef.current.sx,
        y: panRef.current.py + mv.clientY - panRef.current.sy
      })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [pan])

  // ---- Zoom via wheel ----
  const onWheel = useCallback((e) => {
    e.preventDefault()
    setZoom(z => Math.max(0.3, Math.min(2, z - e.deltaY * 0.001)))
  }, [])

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  // ---- Close on Escape ----
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // ---- Relationship connector paths ----
  const getConnectorPath = (fromName, toName) => {
    const fp = positions[fromName]
    const tp = positions[toName]
    if (!fp || !tp) return null
    const fh = getTableHeight(schema[fromName])
    const th = getTableHeight(schema[toName])

    const fx = fp.x + TABLE_WIDTH
    const fy = fp.y + fh / 2
    const tx = tp.x
    const ty = tp.y + th / 2

    const cx1 = fx + Math.abs(tx - fx) * 0.5
    const cy1 = fy
    const cx2 = tx - Math.abs(tx - fx) * 0.5
    const cy2 = ty

    return `M ${fx} ${fy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`
  }

  const fitView = () => {
    const el = canvasAreaRef.current
    const w = el ? el.clientWidth : 1200
    const h = el ? el.clientHeight : 680
    setZoom(getFitZoom(Object.keys(schema).length, schema, w, h))
    setPan({ x: 0, y: 0 })
  }

  const resetView = () => {
    setPositions(getInitialPositions(schema))
    const el = canvasAreaRef.current
    const w = el ? el.clientWidth : 1200
    const h = el ? el.clientHeight : 680
    setZoom(getFitZoom(Object.keys(schema).length, schema, w, h))
    setPan({ x: 0, y: 0 })
  }

  return (
    <div className="erd-modal-overlay" onClick={onClose}>
      <div className="erd-modal" onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div className="erd-modal-header">
          <div className="erd-modal-title">
            <span>🗺️</span>
            <span>{t?.erdTitle || 'Schema Diagram'}</span>
            <span className="erd-modal-badge">{Object.keys(schema).length} tables</span>
          </div>
          <div className="erd-modal-controls">
            <button className="erd-ctrl-btn" onClick={() => setZoom(z => Math.min(2, z + 0.1))} title="Zoom In">＋</button>
            <span className="erd-zoom-label">{Math.round(zoom * 100)}%</span>
            <button className="erd-ctrl-btn" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} title="Zoom Out">－</button>
            <button className="erd-ctrl-btn" onClick={fitView} title="Fit All Tables">⊡</button>
            <button className="erd-ctrl-btn erd-reset-btn" onClick={resetView} title="Reset View">⟳</button>
            <button className="erd-close-btn" onClick={onClose} title="Close (Esc)">✕</button>
          </div>
        </div>

        {/* Hint bar */}
        <div className="erd-modal-hint">
          🖱 Drag tables to rearrange &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Drag canvas to pan &nbsp;·&nbsp; Click table to query
        </div>

        {/* Table count warning for large schemas */}
        {Object.keys(schema).length > 15 && (
          <div className="erd-large-hint">
            📊 {Object.keys(schema).length} tables — use ⊡ Fit or scroll to zoom out to see all
          </div>
        )}

        {/* SVG Canvas */}
        <div className="erd-canvas-area" ref={canvasAreaRef}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ cursor: 'grab' }}
            onMouseDown={onCanvasMouseDown}
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#58a6ff" opacity="0.8" />
              </marker>
              {/* Crow's foot marker */}
              <marker id="crowfoot" markerWidth="10" markerHeight="10" refX="0" refY="5" orient="auto">
                <line x1="0" y1="0" x2="6" y2="5" stroke="#58a6ff" strokeWidth="1.5" opacity="0.8" />
                <line x1="0" y1="10" x2="6" y2="5" stroke="#58a6ff" strokeWidth="1.5" opacity="0.8" />
                <line x1="3" y1="0" x2="9" y2="5" stroke="#58a6ff" strokeWidth="1.5" opacity="0.8" />
                <line x1="3" y1="10" x2="9" y2="5" stroke="#58a6ff" strokeWidth="1.5" opacity="0.8" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>

              {/* Relationship lines */}
              {relationships.map((rel, i) => {
                const path = getConnectorPath(rel.from, rel.to)
                if (!path) return null
                const isHighlighted = selected === rel.from || selected === rel.to
                return (
                  <g key={i}>
                    <path
                      d={path}
                      fill="none"
                      stroke={isHighlighted ? '#a371f7' : '#58a6ff'}
                      strokeWidth={isHighlighted ? 2 : 1.5}
                      strokeDasharray={isHighlighted ? 'none' : '5,3'}
                      opacity={isHighlighted ? 1 : 0.5}
                      markerEnd="url(#arrow)"
                      filter={isHighlighted ? 'url(#glow)' : 'none'}
                      style={{ transition: 'stroke 0.2s, opacity 0.2s' }}
                    />
                    {/* Relationship label */}
                    {isHighlighted && (() => {
                      const fp = positions[rel.from]
                      const tp = positions[rel.to]
                      if (!fp || !tp) return null
                      const fh = getTableHeight(schema[rel.from])
                      const th = getTableHeight(schema[rel.to])
                      const mx = (fp.x + TABLE_WIDTH + tp.x) / 2
                      const my = (fp.y + fh / 2 + tp.y + th / 2) / 2
                      return (
                        <text x={mx} y={my - 6} textAnchor="middle" fontSize="9" fill="#a371f7" opacity="0.9">
                          {rel.col}
                        </text>
                      )
                    })()}
                  </g>
                )
              })}

              {/* Table nodes */}
              {Object.entries(schema).map(([name, cols]) => {
                const pos = positions[name]
                if (!pos) return null
                const tableH = getTableHeight(cols)
                const isSelected = selected === name
                const displayCols = cols.slice(0, 8)

                return (
                  <g
                    key={name}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    style={{ cursor: 'grab' }}
                    onMouseDown={(e) => onTableMouseDown(e, name)}
                    onClick={() => {
                      setSelected(name)
                      if (onTableSelect) onTableSelect(name)
                    }}
                  >
                    {/* Shadow */}
                    <rect
                      x="3" y="3"
                      width={TABLE_WIDTH} height={tableH}
                      rx="8" ry="8"
                      fill="black" opacity="0.4"
                    />

                    {/* Card background */}
                    <rect
                      width={TABLE_WIDTH} height={tableH}
                      rx="8" ry="8"
                      fill="#161b22"
                      stroke={isSelected ? '#a371f7' : '#30363d'}
                      strokeWidth={isSelected ? 2 : 1}
                      filter={isSelected ? 'url(#glow)' : 'none'}
                    />

                    {/* Header gradient */}
                    <defs>
                      <linearGradient id={`hg-${name}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={isSelected ? '#6e40c9' : '#1f6feb'} />
                        <stop offset="100%" stopColor={isSelected ? '#a371f7' : '#58a6ff'} />
                      </linearGradient>
                    </defs>
                    <rect
                      width={TABLE_WIDTH} height={HEADER_HEIGHT}
                      rx="8" ry="8"
                      fill={`url(#hg-${name})`}
                    />
                    <rect
                      y={HEADER_HEIGHT - 8}
                      width={TABLE_WIDTH} height="8"
                      fill={`url(#hg-${name})`}
                    />

                    {/* Table name */}
                    <text
                      x={TABLE_WIDTH / 2} y={HEADER_HEIGHT / 2 + 5}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill="white"
                      fontFamily="Inter, sans-serif"
                    >
                      {name}
                    </text>

                    {/* Columns */}
                    {displayCols.map((col, idx) => {
                      const rowY = HEADER_HEIGHT + 4 + idx * ROW_HEIGHT
                      const isAlt = idx % 2 === 1
                      return (
                        <g key={idx}>
                          {isAlt && (
                            <rect
                              y={rowY}
                              width={TABLE_WIDTH} height={ROW_HEIGHT}
                              fill="rgba(255,255,255,0.02)"
                            />
                          )}
                          {/* PK badge */}
                          {col.isPrimaryKey && (
                            <rect x="6" y={rowY + 7} width="20" height="14" rx="3" fill="rgba(240,136,62,0.2)" stroke="rgba(240,136,62,0.5)" strokeWidth="0.5" />
                          )}
                          {col.isPrimaryKey && (
                            <text x="16" y={rowY + 19} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#f0883e" fontFamily="JetBrains Mono, monospace">PK</text>
                          )}
                          {/* FK badge */}
                          {col.isForeignKey && (
                            <rect x="6" y={rowY + 7} width="20" height="14" rx="3" fill="rgba(88,166,255,0.2)" stroke="rgba(88,166,255,0.5)" strokeWidth="0.5" />
                          )}
                          {col.isForeignKey && (
                            <text x="16" y={rowY + 19} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#58a6ff" fontFamily="JetBrains Mono, monospace">FK</text>
                          )}
                          {/* Col name */}
                          <text
                            x={col.isPrimaryKey || col.isForeignKey ? 32 : 10}
                            y={rowY + 19}
                            fontSize="11"
                            fill={col.isPrimaryKey ? '#f0883e' : col.isForeignKey ? '#58a6ff' : '#e6edf3'}
                            fontFamily="JetBrains Mono, monospace"
                          >
                            {col.name.length > 16 ? col.name.slice(0, 14) + '…' : col.name}
                          </text>
                          {/* Col type */}
                          <text
                            x={TABLE_WIDTH - 6}
                            y={rowY + 19}
                            textAnchor="end"
                            fontSize="9"
                            fill="#6e7681"
                            fontFamily="JetBrains Mono, monospace"
                          >
                            {col.type?.split('(')[0]?.slice(0, 10)}
                          </text>
                          {/* Divider */}
                          {idx < displayCols.length - 1 && (
                            <line x1="0" y1={rowY + ROW_HEIGHT} x2={TABLE_WIDTH} y2={rowY + ROW_HEIGHT} stroke="#21262d" strokeWidth="0.5" />
                          )}
                        </g>
                      )
                    })}

                    {/* More indicator */}
                    {cols.length > 8 && (
                      <text
                        x={TABLE_WIDTH / 2}
                        y={HEADER_HEIGHT + 4 + 8 * ROW_HEIGHT}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#6e7681"
                        fontFamily="Inter, sans-serif"
                      >
                        +{cols.length - 8} more…
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="erd-modal-legend">
          <span className="erd-leg-item"><span className="erd-leg-pk">PK</span> Primary Key</span>
          <span className="erd-leg-sep">·</span>
          <span className="erd-leg-item"><span className="erd-leg-fk">FK</span> Foreign Key</span>
          <span className="erd-leg-sep">·</span>
          <span className="erd-leg-item"><span className="erd-leg-line">- -→</span> Relationship</span>
          <span className="erd-leg-sep">·</span>
          <span className="erd-leg-item erd-leg-muted">Highlighted = selected relation</span>
        </div>
      </div>
    </div>
  )
}

export default ERDiagram
