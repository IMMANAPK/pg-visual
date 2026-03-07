// Learning Path - Structured SQL Curriculum

const learningData = {
  paths: [
    {
      id: 'beginner',
      title: 'SQL Basics',
      titleTamil: 'SQL அடிப்படைகள்',
      titleHindi: 'SQL मूल बातें',
      icon: '🌱',
      color: '#3fb950',
      lessons: [
        {
          id: 'select-basics',
          title: 'SELECT Basics',
          description: 'Learn to retrieve data from tables',
          descThanglish: 'Tables la irundhu data retrieve panna kathukkalam',
          icon: '📋',
          theory: `
## SELECT Statement

The SELECT statement is used to retrieve data from a database table.

### Basic Syntax:
\`\`\`sql
SELECT column1, column2 FROM table_name;
\`\`\`

### Select All Columns:
\`\`\`sql
SELECT * FROM table_name;
\`\`\`

**JavaScript Comparison:**
- \`SELECT * FROM users\` is like \`users.map(u => u)\`
- \`SELECT name FROM users\` is like \`users.map(u => u.name)\`
          `,
          challenges: [
            {
              id: 'ch1',
              title: 'Select All Users',
              task: 'Write a query to select all columns from the users table',
              hint: 'Use SELECT * FROM ...',
              expectedPattern: /SELECT\s+\*\s+FROM\s+users/i,
              points: 10
            },
            {
              id: 'ch2',
              title: 'Select Specific Columns',
              task: 'Select only the name and email columns from users',
              hint: 'List column names separated by commas',
              expectedPattern: /SELECT\s+(name\s*,\s*email|email\s*,\s*name)\s+FROM\s+users/i,
              points: 15
            }
          ]
        },
        {
          id: 'where-clause',
          title: 'WHERE Clause',
          description: 'Filter data with conditions',
          descThanglish: 'Conditions use panni data filter pannalam',
          icon: '🔍',
          theory: `
## WHERE Clause

The WHERE clause filters rows based on conditions.

### Basic Syntax:
\`\`\`sql
SELECT * FROM table_name WHERE condition;
\`\`\`

### Operators:
- \`=\` Equal
- \`!=\` or \`<>\` Not equal
- \`>\`, \`<\`, \`>=\`, \`<=\` Comparison
- \`LIKE\` Pattern matching
- \`IN\` Multiple values
- \`BETWEEN\` Range

**JavaScript Comparison:**
- \`WHERE role = 'admin'\` is like \`.filter(u => u.role === 'admin')\`
          `,
          challenges: [
            {
              id: 'ch3',
              title: 'Filter by Role',
              task: 'Select all users where role is "admin"',
              hint: 'Use WHERE role = \'admin\'',
              expectedPattern: /SELECT\s+.+\s+FROM\s+users\s+WHERE\s+role\s*=\s*'admin'/i,
              points: 15
            },
            {
              id: 'ch4',
              title: 'Filter with Comparison',
              task: 'Select posts with views greater than 100',
              hint: 'Use WHERE views > 100',
              expectedPattern: /SELECT\s+.+\s+FROM\s+posts\s+WHERE\s+views\s*>\s*100/i,
              points: 15
            }
          ]
        },
        {
          id: 'order-limit',
          title: 'ORDER BY & LIMIT',
          description: 'Sort and limit results',
          descThanglish: 'Results sort panni limit pannalam',
          icon: '↕️',
          theory: `
## ORDER BY & LIMIT

### ORDER BY - Sort Results:
\`\`\`sql
SELECT * FROM table_name ORDER BY column ASC|DESC;
\`\`\`

### LIMIT - Restrict Rows:
\`\`\`sql
SELECT * FROM table_name LIMIT 10;
\`\`\`

### Combined:
\`\`\`sql
SELECT * FROM posts ORDER BY views DESC LIMIT 5;
\`\`\`

**JavaScript Comparison:**
- \`ORDER BY views DESC\` is like \`.sort((a, b) => b.views - a.views)\`
- \`LIMIT 5\` is like \`.slice(0, 5)\`
          `,
          challenges: [
            {
              id: 'ch5',
              title: 'Top Posts',
              task: 'Select top 5 posts ordered by views (highest first)',
              hint: 'Use ORDER BY views DESC LIMIT 5',
              expectedPattern: /SELECT\s+.+\s+FROM\s+posts\s+ORDER\s+BY\s+views\s+DESC\s+LIMIT\s+5/i,
              points: 20
            },
            {
              id: 'ch6',
              title: 'Recent Users',
              task: 'Select the 3 most recently created users',
              hint: 'Order by created_at DESC',
              expectedPattern: /SELECT\s+.+\s+FROM\s+users\s+ORDER\s+BY\s+created_at\s+DESC\s+LIMIT\s+3/i,
              points: 20
            }
          ]
        }
      ]
    },
    {
      id: 'intermediate',
      title: 'Intermediate SQL',
      titleTamil: 'இடைநிலை SQL',
      titleHindi: 'इंटरमीडिएट SQL',
      icon: '🌿',
      color: '#58a6ff',
      lessons: [
        {
          id: 'joins-intro',
          title: 'JOIN Basics',
          description: 'Combine data from multiple tables',
          descThanglish: 'Multiple tables data combine pannalam',
          icon: '🔗',
          theory: `
## JOIN - Combining Tables

JOINs combine rows from multiple tables based on related columns.

### INNER JOIN:
Returns only matching rows from both tables.
\`\`\`sql
SELECT * FROM posts
INNER JOIN users ON posts.user_id = users.id;
\`\`\`

### LEFT JOIN:
Returns all rows from left table + matching from right.
\`\`\`sql
SELECT * FROM users
LEFT JOIN posts ON users.id = posts.user_id;
\`\`\`

**JavaScript Comparison:**
INNER JOIN is like:
\`\`\`javascript
posts.map(post => ({
  ...post,
  user: users.find(u => u.id === post.user_id)
})).filter(p => p.user)
\`\`\`
          `,
          challenges: [
            {
              id: 'ch7',
              title: 'Posts with Authors',
              task: 'Select all posts with their author names using JOIN',
              hint: 'JOIN users ON posts.user_id = users.id',
              expectedPattern: /SELECT\s+.+\s+FROM\s+posts\s+(INNER\s+)?JOIN\s+users\s+ON/i,
              points: 25
            },
            {
              id: 'ch8',
              title: 'Users with Posts Count',
              task: 'Use LEFT JOIN to show all users even without posts',
              hint: 'LEFT JOIN posts ON users.id = posts.user_id',
              expectedPattern: /SELECT\s+.+\s+FROM\s+users\s+LEFT\s+JOIN\s+posts\s+ON/i,
              points: 25
            }
          ]
        },
        {
          id: 'aggregate-functions',
          title: 'Aggregate Functions',
          description: 'COUNT, SUM, AVG, MAX, MIN',
          descThanglish: 'Data summarize panna functions',
          icon: '📊',
          theory: `
## Aggregate Functions

Functions that operate on sets of rows.

### Common Functions:
- \`COUNT(*)\` - Count rows
- \`SUM(column)\` - Total of values
- \`AVG(column)\` - Average value
- \`MAX(column)\` - Maximum value
- \`MIN(column)\` - Minimum value

### Examples:
\`\`\`sql
SELECT COUNT(*) FROM users;
SELECT AVG(views) FROM posts;
SELECT MAX(views), MIN(views) FROM posts;
\`\`\`

**JavaScript Comparison:**
- \`COUNT(*)\` is like \`users.length\`
- \`SUM(views)\` is like \`posts.reduce((a, p) => a + p.views, 0)\`
- \`AVG(views)\` is like \`posts.reduce(...) / posts.length\`
          `,
          challenges: [
            {
              id: 'ch9',
              title: 'Count Users',
              task: 'Count total number of users',
              hint: 'Use COUNT(*)',
              expectedPattern: /SELECT\s+COUNT\s*\(\s*\*\s*\)\s+FROM\s+users/i,
              points: 15
            },
            {
              id: 'ch10',
              title: 'Average Views',
              task: 'Find the average views across all posts',
              hint: 'Use AVG(views)',
              expectedPattern: /SELECT\s+AVG\s*\(\s*views\s*\)\s+FROM\s+posts/i,
              points: 20
            }
          ]
        },
        {
          id: 'group-by',
          title: 'GROUP BY',
          description: 'Group and aggregate data',
          descThanglish: 'Data group panni aggregate pannalam',
          icon: '📦',
          theory: `
## GROUP BY Clause

Groups rows with the same values and applies aggregate functions.

### Syntax:
\`\`\`sql
SELECT column, COUNT(*)
FROM table_name
GROUP BY column;
\`\`\`

### Example - Posts per User:
\`\`\`sql
SELECT user_id, COUNT(*) as post_count
FROM posts
GROUP BY user_id;
\`\`\`

### With HAVING (filter groups):
\`\`\`sql
SELECT user_id, COUNT(*) as post_count
FROM posts
GROUP BY user_id
HAVING COUNT(*) > 5;
\`\`\`

**JavaScript Comparison:**
GROUP BY is like \`Object.groupBy()\` or lodash \`_.groupBy()\`
          `,
          challenges: [
            {
              id: 'ch11',
              title: 'Posts per User',
              task: 'Count posts for each user_id',
              hint: 'GROUP BY user_id with COUNT(*)',
              expectedPattern: /SELECT\s+.*(user_id|COUNT).*\s+FROM\s+posts\s+GROUP\s+BY\s+user_id/i,
              points: 25
            },
            {
              id: 'ch12',
              title: 'Posts by Status',
              task: 'Count posts grouped by status',
              hint: 'GROUP BY status',
              expectedPattern: /SELECT\s+.*(status|COUNT).*\s+FROM\s+posts\s+GROUP\s+BY\s+status/i,
              points: 25
            }
          ]
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced SQL',
      titleTamil: 'மேம்பட்ட SQL',
      titleHindi: 'एडवांस्ड SQL',
      icon: '🌳',
      color: '#a371f7',
      lessons: [
        {
          id: 'subqueries',
          title: 'Subqueries',
          description: 'Queries inside queries',
          descThanglish: 'Query inside query - nested queries',
          icon: '🔄',
          theory: `
## Subqueries

A query nested inside another query.

### In WHERE Clause:
\`\`\`sql
SELECT * FROM posts
WHERE user_id IN (
  SELECT id FROM users WHERE role = 'admin'
);
\`\`\`

### In FROM Clause:
\`\`\`sql
SELECT avg_views FROM (
  SELECT AVG(views) as avg_views FROM posts
) as subquery;
\`\`\`

### Correlated Subquery:
\`\`\`sql
SELECT * FROM users u
WHERE EXISTS (
  SELECT 1 FROM posts WHERE user_id = u.id
);
\`\`\`

**JavaScript Comparison:**
\`\`\`javascript
// Subquery in WHERE
const adminIds = users.filter(u => u.role === 'admin').map(u => u.id);
posts.filter(p => adminIds.includes(p.user_id));
\`\`\`
          `,
          challenges: [
            {
              id: 'ch13',
              title: 'Admin Posts',
              task: 'Select posts by admin users using a subquery',
              hint: 'WHERE user_id IN (SELECT id FROM users WHERE ...)',
              expectedPattern: /SELECT\s+.+\s+FROM\s+posts\s+WHERE\s+user_id\s+IN\s*\(/i,
              points: 30
            },
            {
              id: 'ch14',
              title: 'Above Average',
              task: 'Find posts with views above average',
              hint: 'WHERE views > (SELECT AVG(views) FROM posts)',
              expectedPattern: /SELECT\s+.+\s+FROM\s+posts\s+WHERE\s+views\s*>\s*\(\s*SELECT\s+AVG/i,
              points: 35
            }
          ]
        },
        {
          id: 'complex-joins',
          title: 'Complex JOINs',
          description: 'Multiple table joins',
          descThanglish: 'Multiple tables join pannalam',
          icon: '🕸️',
          theory: `
## Multiple Table JOINs

Join more than 2 tables in a single query.

### Three Table Join:
\`\`\`sql
SELECT
  posts.title,
  users.name as author,
  comments.body as comment
FROM posts
JOIN users ON posts.user_id = users.id
JOIN comments ON posts.id = comments.post_id;
\`\`\`

### Self Join:
\`\`\`sql
SELECT
  e.name as employee,
  m.name as manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
\`\`\`

### Many-to-Many (via junction table):
\`\`\`sql
SELECT posts.title, tags.name
FROM posts
JOIN post_tags ON posts.id = post_tags.post_id
JOIN tags ON post_tags.tag_id = tags.id;
\`\`\`
          `,
          challenges: [
            {
              id: 'ch15',
              title: 'Posts with Tags',
              task: 'Join posts, post_tags, and tags tables',
              hint: 'Need two JOINs through post_tags',
              expectedPattern: /FROM\s+posts\s+.*JOIN\s+post_tags.*JOIN\s+tags/i,
              points: 35
            },
            {
              id: 'ch16',
              title: 'Full Comment Thread',
              task: 'Show comments with post title and commenter name',
              hint: 'Join comments, posts, and users',
              expectedPattern: /FROM\s+comments\s+.*JOIN.*JOIN/i,
              points: 40
            }
          ]
        }
      ]
    }
  ],

  badges: [
    { id: 'first-query', title: 'First Query', icon: '🎯', description: 'Complete your first challenge', requirement: 1 },
    { id: 'beginner', title: 'SQL Beginner', icon: '🌱', description: 'Complete all beginner lessons', requirement: 'beginner-complete' },
    { id: 'intermediate', title: 'SQL Explorer', icon: '🌿', description: 'Complete all intermediate lessons', requirement: 'intermediate-complete' },
    { id: 'advanced', title: 'SQL Master', icon: '🌳', description: 'Complete all advanced lessons', requirement: 'advanced-complete' },
    { id: 'perfectionist', title: 'Perfectionist', icon: '⭐', description: 'Complete a lesson with 100% score', requirement: 'perfect-lesson' },
    { id: 'streak-3', title: '3 Day Streak', icon: '🔥', description: 'Practice 3 days in a row', requirement: 'streak-3' },
    { id: 'points-100', title: 'Century', icon: '💯', description: 'Earn 100 points', requirement: 100 },
    { id: 'points-500', title: 'High Scorer', icon: '🏆', description: 'Earn 500 points', requirement: 500 }
  ]
}

export default learningData
