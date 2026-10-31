const PG_FOREIGN_KEY_VIOLATION = '23503';

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }
  if (err.code === PG_FOREIGN_KEY_VIOLATION) {
    return res.status(400).json({ error: 'Validation failed', details: ['referenced criminal does not exist'] });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFoundHandler, errorHandler };
