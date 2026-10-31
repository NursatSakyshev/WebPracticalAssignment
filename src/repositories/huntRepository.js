const { pool } = require('../db');

const SELECT_HUNT = `
  SELECT h.id, h.criminal_id, c.nickname AS criminal_nickname,
         h.success, h.notes, h.created_at
  FROM hunt_logs h
  JOIN criminals c ON c.id = h.criminal_id`;

async function findAll({ criminal_id }) {
  if (criminal_id !== undefined) {
    const result = await pool.query(
      `${SELECT_HUNT} WHERE h.criminal_id = $1 ORDER BY h.created_at, h.id`,
      [criminal_id]
    );
    return result.rows;
  }
  const result = await pool.query(`${SELECT_HUNT} ORDER BY h.created_at, h.id`);
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(`${SELECT_HUNT} WHERE h.id = $1`, [id]);
  return result.rows[0] ?? null;
}

async function create({ criminal_id, success, notes = null }) {
  const result = await pool.query(
    `INSERT INTO hunt_logs (criminal_id, success, notes)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [criminal_id, success, notes]
  );
  return findById(result.rows[0].id);
}

async function update(id, changes) {
  const fields = Object.keys(changes);
  const assignments = fields.map((field, i) => `${field} = $${i + 1}`);
  const result = await pool.query(
    `UPDATE hunt_logs SET ${assignments.join(', ')} WHERE id = $${fields.length + 1} RETURNING id`,
    [...fields.map((field) => changes[field]), id]
  );
  if (result.rowCount === 0) {
    return null;
  }
  return findById(id);
}

async function remove(id) {
  const result = await pool.query('DELETE FROM hunt_logs WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
