-- PG Visual Authentication Schema
-- Run this in your Neon database

-- Users table
CREATE TABLE IF NOT EXISTS app_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Saved database connections per user
CREATE TABLE IF NOT EXISTS saved_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
  connection_name VARCHAR(100) NOT NULL,
  connection_string TEXT NOT NULL,
  database_name VARCHAR(100),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Query history per user
CREATE TABLE IF NOT EXISTS user_query_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
  connection_id INTEGER REFERENCES saved_connections(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  row_count INTEGER,
  execution_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  language VARCHAR(20) DEFAULT 'english',
  theme VARCHAR(20) DEFAULT 'dark',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_connections_user ON saved_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_user ON user_query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_created ON user_query_history(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_app_users_updated_at ON app_users;
CREATE TRIGGER update_app_users_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_connections_updated_at ON saved_connections;
CREATE TRIGGER update_saved_connections_updated_at
    BEFORE UPDATE ON saved_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
