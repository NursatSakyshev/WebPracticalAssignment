const MAX_ID = 2147483647;

function isValidId(value) {
  return Number.isInteger(value) && value >= 1 && value <= MAX_ID;
}

function idParam(req, res, next, id) {
  const n = Number(id);
  if (!/^\d+$/.test(id) || !isValidId(n)) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }
  req.id = n;
  next();
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

module.exports = { isValidId, idParam, isPlainObject };
