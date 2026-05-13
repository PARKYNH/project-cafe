const pool = require("../config/db");

async function listActive() {
  const [rows] = await pool.query(
    `
    SELECT branch_id, name, address, phone, open_time, close_time
    FROM branches
    WHERE is_active = 1
    ORDER BY branch_id ASC
    `
  );
  return rows;
}

module.exports = {
  listActive,
};

