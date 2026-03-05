function Playground({ sql, setSql, onRun, loading, t }) {
  const exampleQueries = [
    { label: t.allUsers, sql: 'SELECT * FROM users;' },
    { label: t.topPosts, sql: `SELECT title, views FROM posts WHERE status = 'published' ORDER BY views DESC;` },
    { label: t.postCount, sql: `SELECT users.name, COUNT(posts.id) as post_count FROM users LEFT JOIN posts ON users.id = posts.user_id GROUP BY users.name;` },
    { label: t.postsTags, sql: `SELECT posts.title, tags.name as tag FROM posts INNER JOIN post_tags ON posts.id = post_tags.post_id INNER JOIN tags ON post_tags.tag_id = tags.id;` },
    { label: t.statsByStatus, sql: `SELECT status, COUNT(*) as total, SUM(views) as total_views FROM posts GROUP BY status;` }
  ]

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onRun()
    }
  }

  return (
    <div className="playground">
      <div className="playground-header">
        <h2>{t.sqlPlayground}</h2>
        <span className="shortcut-hint">{t.ctrlEnterToRun}</span>
      </div>

      <div className="example-queries">
        {exampleQueries.map((example, index) => (
          <button
            key={index}
            className="example-btn"
            onClick={() => setSql(example.sql)}
          >
            {example.label}
          </button>
        ))}
      </div>

      <div className="editor-container">
        <textarea
          className="sql-editor"
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="SELECT * FROM users;"
          spellCheck={false}
        />
      </div>

      <button
        className="run-btn"
        onClick={onRun}
        disabled={loading || !sql.trim()}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            {t.running}
          </>
        ) : (
          <>
            <span className="play-icon">▶</span>
            {t.runQuery}
          </>
        )}
      </button>
    </div>
  )
}

export default Playground
