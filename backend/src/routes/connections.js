const express = require('express');
const { Pool } = require('pg');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Store active connections per user session
const userConnections = new Map();

// GET /api/connections - Get all saved connections for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, connection_name, database_name, is_default, created_at
       FROM saved_connections
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [req.user.id]
    );

    res.json({ connections: result.rows });
  } catch (err) {
    console.error('Get connections error:', err);
    res.status(500).json({ error: 'Failed to get connections' });
  }
});

// POST /api/connections - Save a new connection
router.post('/', authenticateToken, async (req, res) => {
  const { connectionName, connectionString, isDefault } = req.body;

  if (!connectionName || !connectionString) {
    return res.status(400).json({ error: 'Connection name and string are required' });
  }

  try {
    // Test the connection first
    const testPool = new Pool({
      connectionString,
      max: 1,
      connectionTimeoutMillis: 5000
    });

    const testResult = await testPool.query('SELECT current_database() as db');
    const databaseName = testResult.rows[0].db;
    await testPool.end();

    // If setting as default, unset other defaults
    if (isDefault) {
      await pool.query(
        'UPDATE saved_connections SET is_default = FALSE WHERE user_id = $1',
        [req.user.id]
      );
    }

    // Save the connection
    const result = await pool.query(
      `INSERT INTO saved_connections (user_id, connection_name, connection_string, database_name, is_default)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, connection_name, database_name, is_default, created_at`,
      [req.user.id, connectionName, connectionString, databaseName, isDefault || false]
    );

    res.status(201).json({
      message: 'Connection saved successfully',
      connection: result.rows[0]
    });
  } catch (err) {
    console.error('Save connection error:', err);
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      return res.status(400).json({ error: 'Could not connect to database. Check your connection string.' });
    }
    res.status(500).json({ error: 'Failed to save connection', details: err.message });
  }
});

// PUT /api/connections/:id - Update a connection
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { connectionName, connectionString, isDefault } = req.body;

  try {
    // Verify ownership
    const ownership = await pool.query(
      'SELECT id FROM saved_connections WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (ownership.rows.length === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    let databaseName = null;
    if (connectionString) {
      // Test new connection string
      const testPool = new Pool({
        connectionString,
        max: 1,
        connectionTimeoutMillis: 5000
      });
      const testResult = await testPool.query('SELECT current_database() as db');
      databaseName = testResult.rows[0].db;
      await testPool.end();
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await pool.query(
        'UPDATE saved_connections SET is_default = FALSE WHERE user_id = $1',
        [req.user.id]
      );
    }

    // Update the connection
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    if (connectionName) {
      paramCount++;
      updateFields.push(`connection_name = $${paramCount}`);
      values.push(connectionName);
    }
    if (connectionString) {
      paramCount++;
      updateFields.push(`connection_string = $${paramCount}`);
      values.push(connectionString);
      paramCount++;
      updateFields.push(`database_name = $${paramCount}`);
      values.push(databaseName);
    }
    if (typeof isDefault === 'boolean') {
      paramCount++;
      updateFields.push(`is_default = $${paramCount}`);
      values.push(isDefault);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id, req.user.id);
    const result = await pool.query(
      `UPDATE saved_connections SET ${updateFields.join(', ')}
       WHERE id = $${paramCount + 1} AND user_id = $${paramCount + 2}
       RETURNING id, connection_name, database_name, is_default`,
      values
    );

    res.json({ connection: result.rows[0] });
  } catch (err) {
    console.error('Update connection error:', err);
    res.status(500).json({ error: 'Failed to update connection' });
  }
});

// DELETE /api/connections/:id - Delete a connection
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM saved_connections WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Clear active connection if deleted
    const key = `${req.user.id}-${id}`;
    if (userConnections.has(key)) {
      await userConnections.get(key).end();
      userConnections.delete(key);
    }

    res.json({ message: 'Connection deleted' });
  } catch (err) {
    console.error('Delete connection error:', err);
    res.status(500).json({ error: 'Failed to delete connection' });
  }
});

// POST /api/connections/:id/connect - Connect to a saved database
router.post('/:id/connect', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Get connection details
    const result = await pool.query(
      'SELECT connection_string, connection_name, database_name FROM saved_connections WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const { connection_string, connection_name, database_name } = result.rows[0];

    // Create connection pool
    const userPool = new Pool({
      connectionString: connection_string,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    // Test connection
    await userPool.query('SELECT 1');

    // Get schema
    const schemaResult = await userPool.query(`
      SELECT table_name, column_name, data_type,
             is_nullable, column_default,
             (SELECT COUNT(*) FROM information_schema.table_constraints tc
              JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
              WHERE tc.table_name = c.table_name AND kcu.column_name = c.column_name
              AND tc.constraint_type = 'PRIMARY KEY') > 0 as is_primary,
             (SELECT COUNT(*) FROM information_schema.table_constraints tc
              JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
              WHERE tc.table_name = c.table_name AND kcu.column_name = c.column_name
              AND tc.constraint_type = 'FOREIGN KEY') > 0 as is_foreign
      FROM information_schema.columns c
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    // Format schema
    const schema = {};
    for (const row of schemaResult.rows) {
      if (!schema[row.table_name]) {
        schema[row.table_name] = [];
      }
      schema[row.table_name].push({
        name: row.column_name,
        type: row.data_type.toUpperCase(),
        isPrimaryKey: row.is_primary,
        isForeignKey: row.is_foreign,
        nullable: row.is_nullable === 'YES',
        default: row.column_default
      });
    }

    // Store active connection
    const key = `${req.user.id}-active`;
    if (userConnections.has(key)) {
      await userConnections.get(key).end();
    }
    userConnections.set(key, { pool: userPool, connectionId: id });

    res.json({
      message: 'Connected successfully',
      database: database_name,
      connectionName: connection_name,
      connectionId: id,
      schema
    });
  } catch (err) {
    console.error('Connect error:', err);
    res.status(500).json({ error: 'Failed to connect', details: err.message });
  }
});

// POST /api/connections/query - Run query on active connection
router.post('/query', authenticateToken, async (req, res) => {
  const { sql, connectionId } = req.body;

  if (!sql) {
    return res.status(400).json({ error: 'SQL query is required' });
  }

  // Security: Only allow SELECT
  const trimmedSql = sql.trim().toUpperCase();
  if (!trimmedSql.startsWith('SELECT') && !trimmedSql.startsWith('WITH')) {
    return res.status(400).json({ error: 'Only SELECT queries are allowed for security' });
  }

  try {
    const key = `${req.user.id}-active`;
    const activeConn = userConnections.get(key);

    if (!activeConn) {
      return res.status(400).json({ error: 'No active connection. Please connect to a database first.' });
    }

    const start = Date.now();
    const result = await activeConn.pool.query(sql);
    const duration = Date.now() - start;

    // Save to history
    await pool.query(
      `INSERT INTO user_query_history (user_id, connection_id, query_text, row_count, execution_time_ms)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, activeConn.connectionId, sql, result.rowCount, duration]
    );

    res.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields?.map(f => f.name),
      duration
    });
  } catch (err) {
    console.error('Query error:', err);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/connections/disconnect - Disconnect active connection
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const key = `${req.user.id}-active`;
    if (userConnections.has(key)) {
      await userConnections.get(key).pool.end();
      userConnections.delete(key);
    }
    res.json({ message: 'Disconnected' });
  } catch (err) {
    console.error('Disconnect error:', err);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

// GET /api/connections/history - Get query history
router.get('/history', authenticateToken, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;

  try {
    const result = await pool.query(
      `SELECT h.id, h.query_text, h.row_count, h.execution_time_ms, h.created_at,
              c.connection_name
       FROM user_query_history h
       LEFT JOIN saved_connections c ON h.connection_id = c.id
       WHERE h.user_id = $1
       ORDER BY h.created_at DESC
       LIMIT $2`,
      [req.user.id, limit]
    );

    res.json({ history: result.rows });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

module.exports = router;
