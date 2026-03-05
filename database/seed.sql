-- PG Visual - Database Seed File
-- Run: psql -U postgres -d pgvisual -f database/seed.sql

-- Drop existing tables (if re-seeding)
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Seed users
INSERT INTO users (name, email, role) VALUES
  ('Imman Dev', 'imman@pgvisual.dev', 'admin'),
  ('Priya Frontend', 'priya@pgvisual.dev', 'editor'),
  ('Raj Fullstack', 'raj@pgvisual.dev', 'editor'),
  ('Sara Designer', 'sara@pgvisual.dev', 'viewer'),
  ('Karthik Backend', 'karthik@pgvisual.dev', 'viewer');

-- Seed posts
INSERT INTO posts (user_id, title, content, status, views) VALUES
  (1, 'Getting started with React hooks', 'Learn how to use useState and useEffect in your React applications.', 'published', 1240),
  (1, 'PostgreSQL for frontend devs', 'A gentle introduction to databases for developers coming from the frontend world.', 'published', 890),
  (2, 'CSS Grid complete guide', 'Master CSS Grid layout with practical examples and tips.', 'published', 2100),
  (2, 'TypeScript tips and tricks', 'Advanced TypeScript patterns every developer should know.', 'draft', 0),
  (3, 'Node.js performance tuning', 'Optimize your Node.js applications for better performance.', 'published', 450),
  (3, 'REST vs GraphQL', 'Comparing two popular API paradigms and when to use each.', 'archived', 320),
  (4, 'Figma to React workflow', 'Streamline your design-to-code workflow with these best practices.', 'published', 780),
  (1, 'Building a design system', 'Create a scalable design system for your React applications.', 'draft', 0);

-- Seed comments
INSERT INTO comments (post_id, user_id, body) VALUES
  (1, 2, 'Great article! Really helped me understand hooks.'),
  (1, 3, 'Can you cover useCallback next?'),
  (2, 4, 'Finally a DB article for frontend devs!'),
  (3, 1, 'The grid examples are super clear.'),
  (5, 2, 'Bookmarked this for later.'),
  (1, 4, 'This changed how I think about state management!'),
  (3, 3, 'CSS Grid is so much better than floats.'),
  (7, 1, 'Great workflow tips, thanks Sara!');

-- Seed tags
INSERT INTO tags (name) VALUES
  ('react'),
  ('postgresql'),
  ('css'),
  ('typescript'),
  ('nodejs'),
  ('performance'),
  ('beginners');

-- Seed post_tags (many-to-many relationships)
INSERT INTO post_tags (post_id, tag_id) VALUES
  (1, 1), (1, 7),  -- React hooks: react, beginners
  (2, 2), (2, 7),  -- PostgreSQL for frontend: postgresql, beginners
  (3, 3),          -- CSS Grid: css
  (4, 4),          -- TypeScript: typescript
  (5, 5), (5, 6),  -- Node.js perf: nodejs, performance
  (6, 5),          -- REST vs GraphQL: nodejs
  (7, 1), (7, 3),  -- Figma to React: react, css
  (8, 1);          -- Design system: react

-- Verify data
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Posts:', COUNT(*) FROM posts
UNION ALL
SELECT 'Comments:', COUNT(*) FROM comments
UNION ALL
SELECT 'Tags:', COUNT(*) FROM tags
UNION ALL
SELECT 'Post_Tags:', COUNT(*) FROM post_tags;
