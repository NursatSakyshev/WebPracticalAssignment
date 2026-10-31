const { pool } = require('../db');

const ORDER_BY = {
  reward: 'reward ASC, id ASC',
  '-reward': 'reward DESC, id ASC',
};

const FILTERS = {
  min_reward: 'reward >=',
  max_reward: 'reward <=',
  armed: 'armed =',
  has_crew: 'has_crew =',
  escape_master: 'escape_master =',
};

function toCriminal(row) {
  const { last_latitude, last_longitude, last_location_note, ...criminal } = row;
  const hasLocation = last_latitude !== null || last_location_note !== null;
  return {
    ...criminal,
    last_known_location: hasLocation
      ? {
          coordinates: last_latitude === null
            ? null
            : { latitude: last_latitude, longitude: last_longitude },
          note: last_location_note,
        }
      : null,
  };
}

async function findAll(filters) {
  const conditions = [];
  const params = [];

  for (const [param, condition] of Object.entries(FILTERS)) {
    if (filters[param] !== undefined) {
      params.push(filters[param]);
      conditions.push(`${condition} $${params.length}`);
    }
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = ORDER_BY[filters.sort] ?? 'id ASC';

  const result = await pool.query(`SELECT * FROM criminals ${where} ORDER BY ${orderBy}`, params);
  return result.rows.map(toCriminal);
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM criminals WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return null;
  }
  const hunts = await pool.query(
    `SELECT id, success, notes, created_at
     FROM hunt_logs
     WHERE criminal_id = $1
     ORDER BY created_at, id`,
    [id]
  );
  return { ...toCriminal(result.rows[0]), hunts: hunts.rows };
}

async function exists(id) {
  const result = await pool.query('SELECT 1 FROM criminals WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = { findAll, findById, exists };
