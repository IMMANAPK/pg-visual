require('dotenv').config();
const express = require('express');
const cors = require('cors');
const queryRoutes = require('./routes/query');
const explainRoutes = require('./routes/explain');
const suggestRoutes = require('./routes/suggest');
const agentsRoutes = require('./routes/agents');
const databaseRoutes = require('./routes/database');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

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
