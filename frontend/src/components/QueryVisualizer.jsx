import { useState, useEffect } from 'react'

function QueryVisualizer({ sql, result, t }) {
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1500)

  // Parse SQL and generate execution steps
  useEffect(() => {
    if (sql) {
      const parsed = parseSQL(sql)
      setSteps(parsed)
      setCurrentStep(0)
      setIsPlaying(false)
    }
  }, [sql])

  // Auto-play animation
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timer)
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, steps.length, speed])

  const parseSQL = (query) => {
    const upperQuery = query.toUpperCase()
    const steps = []

    // Step 1: FROM - Always first in execution
    const fromMatch = query.match(/FROM\s+(\w+)/i)
    if (fromMatch) {
      steps.push({
        id: 'from',
        title: 'FROM',
        icon: '📋',
        description: t?.fromStep || `Load data from table "${fromMatch[1]}"`,
        detail: t?.fromDetail || 'Database reads all rows from the source table into memory',
        color: '#58a6ff',
        code: `FROM ${fromMatch[1]}`
      })
    }

    // Step 2: JOIN - If present
    const joinMatches = query.match(/(INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+(\w+)\s+ON\s+([^WHERE|ORDER|GROUP|LIMIT]+)/gi)
    if (joinMatches) {
      joinMatches.forEach(join => {
        const joinType = join.match(/(INNER|LEFT|RIGHT|FULL|CROSS)/i)?.[1] || 'INNER'
        const tableName = join.match(/JOIN\s+(\w+)/i)?.[1]
        steps.push({
          id: 'join',
          title: `${joinType} JOIN`,
          icon: '🔗',
          description: t?.joinStep || `Combine with table "${tableName}"`,
          detail: t?.joinDetail || 'Matches rows from both tables based on the ON condition',
          color: '#a371f7',
          code: join.trim()
        })
      })
    }

    // Step 3: WHERE - Filter rows
    const whereMatch = query.match(/WHERE\s+(.+?)(?=ORDER|GROUP|HAVING|LIMIT|;|$)/is)
    if (whereMatch) {
      steps.push({
        id: 'where',
        title: 'WHERE',
        icon: '🔍',
        description: t?.whereStep || 'Filter rows based on conditions',
        detail: t?.whereDetail || `Only keeps rows where: ${whereMatch[1].trim()}`,
        color: '#f0883e',
        code: `WHERE ${whereMatch[1].trim()}`
      })
    }

    // Step 4: GROUP BY - If present
    const groupMatch = query.match(/GROUP\s+BY\s+(.+?)(?=HAVING|ORDER|LIMIT|;|$)/is)
    if (groupMatch) {
      steps.push({
        id: 'group',
        title: 'GROUP BY',
        icon: '📊',
        description: t?.groupStep || 'Group rows together',
        detail: t?.groupDetail || `Groups rows by: ${groupMatch[1].trim()}`,
        color: '#3fb950',
        code: `GROUP BY ${groupMatch[1].trim()}`
      })
    }

    // Step 5: HAVING - If present
    const havingMatch = query.match(/HAVING\s+(.+?)(?=ORDER|LIMIT|;|$)/is)
    if (havingMatch) {
      steps.push({
        id: 'having',
        title: 'HAVING',
        icon: '✅',
        description: t?.havingStep || 'Filter grouped results',
        detail: t?.havingDetail || `Filters groups where: ${havingMatch[1].trim()}`,
        color: '#f85149',
        code: `HAVING ${havingMatch[1].trim()}`
      })
    }

    // Step 6: SELECT - Choose columns
    const selectMatch = query.match(/SELECT\s+(DISTINCT\s+)?(.+?)\s+FROM/is)
    if (selectMatch) {
      const isDistinct = !!selectMatch[1]
      const columns = selectMatch[2].trim()
      steps.push({
        id: 'select',
        title: isDistinct ? 'SELECT DISTINCT' : 'SELECT',
        icon: '📝',
        description: t?.selectStep || `Choose columns: ${columns === '*' ? 'all columns' : columns}`,
        detail: t?.selectDetail || 'Picks only the specified columns from the result',
        color: '#58a6ff',
        code: `SELECT ${isDistinct ? 'DISTINCT ' : ''}${columns}`
      })
    }

    // Step 7: ORDER BY - Sort results
    const orderMatch = query.match(/ORDER\s+BY\s+(.+?)(?=LIMIT|;|$)/is)
    if (orderMatch) {
      steps.push({
        id: 'order',
        title: 'ORDER BY',
        icon: '↕️',
        description: t?.orderStep || 'Sort the results',
        detail: t?.orderDetail || `Sorts by: ${orderMatch[1].trim()}`,
        color: '#a371f7',
        code: `ORDER BY ${orderMatch[1].trim()}`
      })
    }

    // Step 8: LIMIT - Limit results
    const limitMatch = query.match(/LIMIT\s+(\d+)/i)
    if (limitMatch) {
      steps.push({
        id: 'limit',
        title: 'LIMIT',
        icon: '✂️',
        description: t?.limitStep || `Return only ${limitMatch[1]} rows`,
        detail: t?.limitDetail || 'Cuts off the result set at the specified number',
        color: '#f0883e',
        code: `LIMIT ${limitMatch[1]}`
      })
    }

    // Final step: Results
    steps.push({
      id: 'result',
      title: t?.finalResult || 'RESULT',
      icon: '🎯',
      description: t?.resultStep || `Query complete! ${result?.length || 0} rows returned`,
      detail: t?.resultDetail || 'The final result set is returned to you',
      color: '#3fb950',
      code: null
    })

    return steps
  }

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const handleStepClick = (index) => {
    setCurrentStep(index)
    setIsPlaying(false)
  }

  if (!sql || steps.length === 0) {
    return (
      <div className="query-visualizer empty">
        <div className="qv-header">
          <span className="qv-icon">🎬</span>
          <h3>{t?.queryVisualizer || 'Query Execution Flow'}</h3>
        </div>
        <div className="qv-empty">
          <span className="empty-icon">🎯</span>
          <p>{t?.runQueryToVisualize || 'Run a query to see the execution flow'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="query-visualizer">
      <div className="qv-header">
        <span className="qv-icon">🎬</span>
        <h3>{t?.queryVisualizer || 'Query Execution Flow'}</h3>
      </div>

      {/* Controls */}
      <div className="qv-controls">
        <button
          className="qv-btn"
          onClick={isPlaying ? handlePause : handlePlay}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button className="qv-btn" onClick={handleReset} title="Reset">
          🔄
        </button>
        <div className="qv-progress">
          <span>{currentStep + 1}</span>
          <span className="qv-separator">/</span>
          <span>{steps.length}</span>
        </div>
        <div className="qv-speed">
          <label>Speed:</label>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="qv-speed-select"
          >
            <option value={2500}>0.5x</option>
            <option value={1500}>1x</option>
            <option value={1000}>1.5x</option>
            <option value={500}>2x</option>
          </select>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="qv-flow">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`qv-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            onClick={() => handleStepClick(index)}
          >
            <div
              className="qv-step-node"
              style={{
                borderColor: step.color,
                backgroundColor: index <= currentStep ? step.color + '20' : 'transparent'
              }}
            >
              <span className="qv-step-icon">{step.icon}</span>
              <span className="qv-step-title">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`qv-connector ${index < currentStep ? 'active' : ''}`}>
                <div className="qv-arrow">→</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current Step Detail */}
      <div className="qv-detail" style={{ borderLeftColor: steps[currentStep]?.color }}>
        <div className="qv-detail-header">
          <span className="qv-detail-icon">{steps[currentStep]?.icon}</span>
          <h4>{steps[currentStep]?.title}</h4>
        </div>
        <p className="qv-detail-desc">{steps[currentStep]?.description}</p>
        <p className="qv-detail-info">{steps[currentStep]?.detail}</p>
        {steps[currentStep]?.code && (
          <pre className="qv-detail-code">{steps[currentStep].code}</pre>
        )}
      </div>

      {/* Mini Progress Bar */}
      <div className="qv-progress-bar">
        <div
          className="qv-progress-fill"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default QueryVisualizer
