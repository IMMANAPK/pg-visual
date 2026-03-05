const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Store active connections (in production, use Redis or session store)
const connections = new Map();

// Test database connection and fetch schema
router.post('/connect', async (req, res) => {
  const { connectionString, sessionId } = req.body;

  if (!connectionString) {
    return res.status(400).json({ error: 'Connection string is required' });
  }

  // Create new pool for this connection
  const pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  try {
    // Test connection
    const client = await pool.connect();

    // Get database name
    const dbResult = await client.query('SELECT current_database()');
    const dbName = dbResult.rows[0].current_database;

    // Fetch schema
    const schemaResult = await client.query(`
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

    client.release();

    // Group by table
    const schema = {};
    for (const row of schemaResult.rows) {
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

    // Store connection for this session
    if (sessionId) {
      // Close existing connection if any
      if (connections.has(sessionId)) {
        await connections.get(sessionId).end();
      }
      connections.set(sessionId, pool);
    }

    res.json({
      success: true,
      database: dbName,
      schema,
      tableCount: Object.keys(schema).length
    });

  } catch (err) {
    console.error('Database connection error:', err.message);
    await pool.end();
    res.status(400).json({
      error: 'Connection failed',
      details: err.message
    });
  }
});

// Disconnect
router.post('/disconnect', async (req, res) => {
  const { sessionId } = req.body;

  if (sessionId && connections.has(sessionId)) {
    await connections.get(sessionId).end();
    connections.delete(sessionId);
  }

  res.json({ success: true, message: 'Disconnected' });
});

// Run query on custom database
router.post('/query', async (req, res) => {
  const { sql, sessionId } = req.body;

  if (!sql) {
    return res.status(400).json({ error: 'SQL query is required' });
  }

  // Check if SELECT only
  const normalized = sql.trim().toLowerCase();
  const blockedKeywords = [
    'insert', 'update', 'delete', 'drop', 'truncate',
    'alter', 'create', 'grant', 'revoke', 'exec',
    'execute', 'copy', 'pg_', 'set ', 'reset'
  ];

  for (const keyword of blockedKeywords) {
    if (normalized.includes(keyword)) {
      return res.status(400).json({
        error: 'Only SELECT queries are allowed for safety.'
      });
    }
  }

  if (!normalized.startsWith('select') && !normalized.startsWith('with')) {
    return res.status(400).json({
      error: 'Only SELECT queries are allowed.'
    });
  }

  // Get pool for this session
  const pool = connections.get(sessionId);
  if (!pool) {
    return res.status(400).json({
      error: 'No active database connection. Please connect first.'
    });
  }

  const startTime = Date.now();

  try {
    const result = await pool.query(sql);
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
    res.status(400).json({ error: err.message });
  }
});

// Get schema for AI context
router.get('/schema/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const pool = connections.get(sessionId);

  if (!pool) {
    return res.status(400).json({ error: 'No active connection' });
  }

  try {
    const result = await pool.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    // Format for AI prompt
    const tables = {};
    for (const row of result.rows) {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push(`${row.column_name} (${row.data_type})`);
    }

    let schemaText = 'Available tables and columns:\n';
    for (const [table, columns] of Object.entries(tables)) {
      schemaText += `- ${table}: ${columns.join(', ')}\n`;
    }

    res.json({ schemaText, tables });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get connection status
router.get('/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const isConnected = connections.has(sessionId);
  res.json({ connected: isConnected });
});

module.exports = router;
