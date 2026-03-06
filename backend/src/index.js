require('dotenv').config();
const express = require('express');
const cors = require('cors');
const queryRoutes = require('./routes/query');
const explainRoutes = require('./routes/explain');
const suggestRoutes = require('./routes/suggest');
const agentsRoutes = require('./routes/agents');
const databaseRoutes = require('./routes/database');
const authRoutes = require('./routes/auth');
const connectionsRoutes = require('./routes/connections');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/explain', explainRoutes);
app.use('/api/suggest', suggestRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/database', databaseRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PG Visual backend is running' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 PG Visual backend running on port ${PORT}`);
});
