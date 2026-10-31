const express = require('express');
const hunts = require('../repositories/huntRepository');
const criminals = require('../repositories/criminalRepository');
const { validateHunt, parseHuntQuery } = require('../validators/huntValidator');
const { idParam } = require('../validators/common');

const router = express.Router();

router.param('id', idParam);

function validationError(res, details) {
  return res.status(400).json({ error: 'Validation failed', details });
}

function notFound(res) {
  return res.status(404).json({ error: 'Hunt log not found' });
}

router.get('/', async (req, res) => {
  const { errors, filters } = parseHuntQuery(req.query);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid query parameters', details: errors });
  }
  res.json(await hunts.findAll(filters));
});

router.get('/:id', async (req, res) => {
  const hunt = await hunts.findById(req.id);
  if (!hunt) {
    return notFound(res);
  }
  res.json(hunt);
});

router.post('/', async (req, res) => {
  const { errors, data } = validateHunt(req.body);
  if (errors.length > 0) {
    return validationError(res, errors);
  }
  if (!(await criminals.exists(data.criminal_id))) {
    return validationError(res, [`criminal with id ${data.criminal_id} does not exist`]);
  }
  const hunt = await hunts.create(data);
  res.status(201).location(`/api/hunts/${hunt.id}/`).json(hunt);
});

router.patch('/:id', async (req, res) => {
  const { errors, data } = validateHunt(req.body, { partial: true });
  if (errors.length > 0) {
    return validationError(res, errors);
  }
  const hunt = await hunts.update(req.id, data);
  if (!hunt) {
    return notFound(res);
  }
  res.json(hunt);
});

router.delete('/:id', async (req, res) => {
  const deleted = await hunts.remove(req.id);
  if (!deleted) {
    return notFound(res);
  }
  res.status(204).end();
});

module.exports = router;
