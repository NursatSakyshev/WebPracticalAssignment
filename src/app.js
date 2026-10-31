const express = require('express');
const config = require('./config');
const { pool } = require('./db');
const criminalsRouter = require('./routes/criminals');
const huntsRouter = require('./routes/hunts');
const requestLogger = require('./middleware/requestLogger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');

const app = express();

app.use(requestLogger);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: config.appName,
    endpoints: {
      health: 'GET /health',
      listCriminals: 'GET /api/criminals/',
      getCriminal: 'GET /api/criminals/{id}/',
      listHunts: 'GET /api/hunts/',
      getHunt: 'GET /api/hunts/{id}/',
      createHunt: 'POST /api/hunts/',
      updateHunt: 'PATCH /api/hunts/{id}/',
      deleteHunt: 'DELETE /api/hunts/{id}/',
    },
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/api/criminals', criminalsRouter);
app.use('/api/hunts', huntsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
