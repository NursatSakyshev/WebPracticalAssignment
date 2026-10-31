const SORT_OPTIONS = ['reward', '-reward'];
const BOOLEAN_FILTERS = ['armed', 'has_crew', 'escape_master'];

function parseCriminalQuery(query) {
  const errors = [];
  const filters = {};

  for (const param of ['min_reward', 'max_reward']) {
    const value = query[param];
    if (value === undefined) {
      continue;
    }
    const n = Number(value);
    if (typeof value !== 'string' || value.trim() === '' || !Number.isFinite(n) || n < 0) {
      errors.push(`${param} must be a non-negative number`);
    } else {
      filters[param] = n;
    }
  }

  if (filters.min_reward !== undefined && filters.max_reward !== undefined
      && filters.min_reward > filters.max_reward) {
    errors.push('min_reward cannot be greater than max_reward');
  }

  for (const param of BOOLEAN_FILTERS) {
    const value = query[param];
    if (value === undefined) {
      continue;
    }
    if (value === 'true' || value === 'false') {
      filters[param] = value === 'true';
    } else {
      errors.push(`${param} must be true or false`);
    }
  }

  if (query.sort !== undefined) {
    if (SORT_OPTIONS.includes(query.sort)) {
      filters.sort = query.sort;
    } else {
      errors.push(`sort must be one of: ${SORT_OPTIONS.join(', ')}`);
    }
  }

  return { errors, filters };
}

module.exports = { parseCriminalQuery };
