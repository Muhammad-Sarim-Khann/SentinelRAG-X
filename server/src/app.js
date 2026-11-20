const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SentinelRAG-X API'
  });
});
// RAG query input validation endpoint (accepts 1 to 500 characters inclusive)
app.post('/api/validate-query', (req, res) => {
  const { query } = req.body || {};

  if (typeof query !== 'string') {
    return res.status(400).json({
      valid: false,
      message: 'Query is required and must be a string'
    });
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 1) {
    return res.status(400).json({
      valid: false,
      message: 'Query must contain at least 1 character'
    });
  }

  if (trimmedQuery.length > 500) {
    return res.status(400).json({
      valid: false,
      message: 'Query must not exceed 500 characters'
    });
  }

  return res.status(200).json({
    valid: true,
    query: trimmedQuery
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
