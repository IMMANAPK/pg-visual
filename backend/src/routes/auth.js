const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authenticateToken, generateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM app_users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      `INSERT INTO app_users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at`,
      [email.toLowerCase(), passwordHash, name]
    );

    const user = result.rows[0];

    // Create default settings
    await pool.query(
      'INSERT INTO user_settings (user_id, language, theme) VALUES ($1, $2, $3)',
      [user.id, 'english', 'dark']
    );

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash, name FROM app_users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user settings
    const settingsResult = await pool.query(
      'SELECT language, theme FROM user_settings WHERE user_id = $1',
      [user.id]
    );

    const settings = settingsResult.rows[0] || { language: 'english', theme: 'dark' };

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        settings
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.created_at,
              s.language, s.theme
       FROM app_users u
       LEFT JOIN user_settings s ON u.id = s.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        settings: {
          language: user.language || 'english',
          theme: user.theme || 'dark'
        }
      }
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// PUT /api/auth/settings - Update user settings
router.put('/settings', authenticateToken, async (req, res) => {
  const { language, theme } = req.body;

  try {
    await pool.query(
      `INSERT INTO user_settings (user_id, language, theme)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id)
       DO UPDATE SET language = $2, theme = $3`,
      [req.user.id, language || 'english', theme || 'dark']
    );

    res.json({ message: 'Settings updated' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// PUT /api/auth/password - Change password
router.put('/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  try {
    // Get current password hash
    const result = await pool.query(
      'SELECT password_hash FROM app_users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE app_users SET password_hash = $1 WHERE id = $2',
      [newHash, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
