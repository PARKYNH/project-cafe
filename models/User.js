const pool = require("../config/db");

async function findByEmail(email) {
  const [rows] = await pool.query(
    `
    SELECT user_id, email, password, name, phone, social_type, is_active, created_at
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );
  return rows[0] || null;
}

async function findById(userId) {
  const [rows] = await pool.query(
    `
    SELECT user_id, email, name, phone, social_type, is_active, created_at
    FROM users
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );
  return rows[0] || null;
}

async function createUser({ email, passwordHash, name, phone }) {
  const [result] = await pool.query(
    `
    INSERT INTO users (email, password, name, phone, social_type, is_active)
    VALUES (?, ?, ?, ?, 'none', 1)
    `,
    [email, passwordHash, name, phone || null]
  );
  return result.insertId;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
};

