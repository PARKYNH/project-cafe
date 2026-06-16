const pool = require("../config/db");

async function findByEmail(email) {
  const [rows] = await pool.query(
    `
    SELECT user_id, email, password,
       name, phone, social_type,
       is_active, created_at, role
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

async function findByKakaoId(kakaoId) {
  const [rows] = await pool.query(
    `SELECT user_id, email, name, social_type, kakao_id, role, is_active
     FROM users WHERE kakao_id = ? LIMIT 1`,
    [kakaoId]
  );
  return rows[0] || null;
}

async function createKakaoUser({ kakaoId, email, name }) {
  const [result] = await pool.query(
    `INSERT INTO users (email, name, social_type, kakao_id, is_active)
     VALUES (?, ?, 'kakao', ?, 1)`,
    [email || null, name, kakaoId]
  );
  return result.insertId;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  findByKakaoId,
  createKakaoUser,
};

