const express = require('express');
const router = express.Router();
const pool = require('../db');

// Validate that the query is a SELECT statement only
function isSelectOnly(sql) {
  const normalized = sql.trim().toLowerCase();

  // Block dangerous keywords
  const blockedKeywords = [
    'insert', 'update', 'delete', 'drop', 'truncate',
    'alter', 'create', 'grant', 'revoke', 'exec',
    'execute', 'copy', 'pg_', 'set ', 'reset',
    'begin', 'commit', 'rollback', 'savepoint'
  ];

  for (const keyword of blockedKeywords) {
    if (normalized.includes(keyword)) {
      return false;
    }
  }

  // Must start with SELECT or WITH (for CTEs)
  if (!normalized.startsWith('select') && !normalized.startsWith('with')) {
    return false;
  }

  return true;
}

router.post('/', async (req, res) => {
  const { sql } = req.body;

  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({
      error: 'SQL query is required'
    });
  }

  const trimmedSql = sql.trim();

  if (!trimmedSql) {
    return res.status(400).json({
      error: 'SQL query cannot be empty'
    });
  }

  // Security check: only allow SELECT statements
  if (!isSelectOnly(trimmedSql)) {
    return res.status(400).json({
      error: 'Only SELECT queries are allowed in the playground. INSERT, UPDATE, DELETE, and other modifying statements are blocked for safety.'
    });
  }

  const startTime = Date.now();

  try {
    const result = await pool.query(trimmedSql);
    const duration = Date.now() - startTime;

    res.json({
      rows: result.rows,
      fields: result.fields.map(f => ({
        name: f.name,
        dataTypeID: f.dataTypeID
      })),
      rowCount: result.rowCount,
      duration
    });
  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
});

// Get schema information
router.get('/schema', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        CASE
          WHEN pk.column_name IS NOT NULL THEN true
          ELSE false
        END as is_primary_key,
        CASE
          WHEN fk.column_name IS NOT NULL THEN true
          ELSE false
        END as is_foreign_key,
        fk.foreign_table_name
      FROM information_schema.tables t
      JOIN information_schema.columns c
        ON t.table_name = c.table_name AND t.table_schema = c.table_schema
      LEFT JOIN (
        SELECT ku.table_name, ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
      ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
      LEFT JOIN (
        SELECT
          ku.table_name,
          ku.column_name,
          ccu.table_name as foreign_table_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
      ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name, c.ordinal_position;
    `);

    // Group by table
    const schema = {};
    for (const row of result.rows) {
      if (!schema[row.table_name]) {
        schema[row.table_name] = [];
      }
      schema[row.table_name].push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        default: row.column_default,
        isPrimaryKey: row.is_primary_key,
        isForeignKey: row.is_foreign_key,
        foreignTable: row.foreign_table_name
      });
    }

    res.json({ schema });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
