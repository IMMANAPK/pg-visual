import { useState, useRef } from 'react'

function ExportPanel({ sql, result, explanation, t }) {
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState(null)
  const exportRef = useRef(null)

  const exportAsText = () => {
    const content = `
===========================================
PG Visual - SQL Query Export
===========================================

📝 QUERY:
${sql}

📊 RESULTS: ${result?.length || 0} rows

${result && result.length > 0 ? formatResultsAsText(result) : 'No results'}

💡 AI EXPLANATION:
${explanation || 'No explanation available'}

===========================================
Exported from PG Visual
https://pg-visual.vercel.app
===========================================
`

    downloadFile(content, 'query-export.txt', 'text/plain')
  }

  const formatResultsAsText = (rows) => {
    if (!rows || rows.length === 0) return ''

    const columns = Object.keys(rows[0])
    const colWidths = columns.map(col =>
      Math.max(col.length, ...rows.map(r => String(r[col] ?? 'NULL').length))
    )

    let table = columns.map((col, i) => col.padEnd(colWidths[i])).join(' | ') + '\n'
    table += colWidths.map(w => '-'.repeat(w)).join('-+-') + '\n'
    rows.slice(0, 20).forEach(row => {
      table += columns.map((col, i) =>
        String(row[col] ?? 'NULL').padEnd(colWidths[i])
      ).join(' | ') + '\n'
    })

    if (rows.length > 20) {
      table += `\n... and ${rows.length - 20} more rows`
    }

    return table
  }

  const exportAsJSON = () => {
    const data = {
      query: sql,
      results: result,
      rowCount: result?.length || 0,
      explanation: explanation,
      exportedAt: new Date().toISOString(),
      source: 'PG Visual'
    }

    downloadFile(JSON.stringify(data, null, 2), 'query-export.json', 'application/json')
  }

  const exportAsCSV = () => {
    if (!result || result.length === 0) {
      alert(t?.noDataToExport || 'No data to export')
      return
    }

    const columns = Object.keys(result[0])
    let csv = columns.join(',') + '\n'

    result.forEach(row => {
      csv += columns.map(col => {
        const val = row[col]
        if (val === null || val === undefined) return ''
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          return `"${val.replace(/"/g, '""')}"`
        }
        return val
      }).join(',') + '\n'
    })

    downloadFile(csv, 'query-results.csv', 'text/csv')
  }

  const exportAsMarkdown = () => {
    let md = `# SQL Query Export\n\n`
    md += `## Query\n\`\`\`sql\n${sql}\n\`\`\`\n\n`

    if (result && result.length > 0) {
      md += `## Results (${result.length} rows)\n\n`

      const columns = Object.keys(result[0])
      md += '| ' + columns.join(' | ') + ' |\n'
      md += '| ' + columns.map(() => '---').join(' | ') + ' |\n'

      result.slice(0, 20).forEach(row => {
        md += '| ' + columns.map(col => String(row[col] ?? 'NULL')).join(' | ') + ' |\n'
      })

      if (result.length > 20) {
        md += `\n*... and ${result.length - 20} more rows*\n`
      }
      md += '\n'
    }

    if (explanation) {
      md += `## AI Explanation\n\n${explanation}\n\n`
    }

    md += `---\n*Exported from [PG Visual](https://pg-visual.vercel.app) on ${new Date().toLocaleDateString()}*`

    downloadFile(md, 'query-export.md', 'text/markdown')
  }

  const exportAsHTML = () => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PG Visual - Query Export</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #e6edf3; padding: 40px; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { color: #58a6ff; margin-bottom: 30px; display: flex; align-items: center; gap: 12px; }
    h2 { color: #8b949e; font-size: 14px; text-transform: uppercase; margin: 30px 0 15px; }
    .query { background: #161b22; padding: 20px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #58a6ff; white-space: pre-wrap; border: 1px solid #30363d; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
    th { background: #21262d; color: #58a6ff; text-align: left; padding: 12px; border: 1px solid #30363d; }
    td { padding: 10px 12px; border: 1px solid #30363d; font-family: 'JetBrains Mono', monospace; }
    tr:hover td { background: #161b22; }
    .explanation { background: #161b22; padding: 20px; border-radius: 8px; border-left: 3px solid #a371f7; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #30363d; color: #8b949e; font-size: 12px; }
    .badge { background: #238636; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🐘 PG Visual Export</h1>

    <h2>📝 Query</h2>
    <div class="query">${escapeHtml(sql)}</div>

    ${result && result.length > 0 ? `
    <h2>📊 Results <span class="badge">${result.length} rows</span></h2>
    <table>
      <thead>
        <tr>${Object.keys(result[0]).map(col => `<th>${escapeHtml(col)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${result.slice(0, 30).map(row => `
          <tr>${Object.values(row).map(val => `<td>${escapeHtml(String(val ?? 'NULL'))}</td>`).join('')}</tr>
        `).join('')}
      </tbody>
    </table>
    ${result.length > 30 ? `<p style="color: #8b949e;">... and ${result.length - 30} more rows</p>` : ''}
    ` : ''}

    ${explanation ? `
    <h2>💡 AI Explanation</h2>
    <div class="explanation">${escapeHtml(explanation)}</div>
    ` : ''}

    <div class="footer">
      Exported from <strong>PG Visual</strong> on ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>
`

    downloadFile(html, 'query-export.html', 'text/html')
  }

  const escapeHtml = (text) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    const text = `-- SQL Query\n${sql}\n\n-- Results: ${result?.length || 0} rows\n\n-- Explanation:\n${explanation || 'N/A'}`
    await navigator.clipboard.writeText(text)
    alert(t?.copiedToClipboard || 'Copied to clipboard!')
  }

  return (
    <div className="export-panel">
      <div className="export-header">
        <span className="export-icon">📤</span>
        <h3>{t?.export || 'Export'}</h3>
      </div>

      <div className="export-options">
        <button className="export-btn" onClick={exportAsText} title="Plain Text">
          <span>📄</span>
          <span>TXT</span>
        </button>

        <button className="export-btn" onClick={exportAsMarkdown} title="Markdown">
          <span>📝</span>
          <span>MD</span>
        </button>

        <button className="export-btn" onClick={exportAsJSON} title="JSON">
          <span>🔧</span>
          <span>JSON</span>
        </button>

        <button className="export-btn" onClick={exportAsCSV} title="CSV (Results only)">
          <span>📊</span>
          <span>CSV</span>
        </button>

        <button className="export-btn" onClick={exportAsHTML} title="HTML Page">
          <span>🌐</span>
          <span>HTML</span>
        </button>

        <button className="export-btn" onClick={copyToClipboard} title="Copy to clipboard">
          <span>📋</span>
          <span>Copy</span>
        </button>
      </div>
    </div>
  )
}

export default ExportPanel
