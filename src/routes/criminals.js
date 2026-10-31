const express = require('express');
const criminals = require('../repositories/criminalRepository');
const { parseCriminalQuery } = require('../validators/criminalValidator');
const { idParam } = require('../validators/common');

const router = express.Router();

router.param('id', idParam);

router.get('/', async (req, res) => {
  const { errors, filters } = parseCriminalQuery(req.query);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid query parameters', details: errors });
  }
  res.json(await criminals.findAll(filters));
});

router.get('/:id', async (req, res) => {
  const criminal = await criminals.findById(req.id);
  if (!criminal) {
    return res.status(404).json({ error: 'Criminal not found' });
  }
  res.json(criminal);
});

module.exports = router;
