// 스탬프 DAO
// Java의 Mapper 역할!

const pool = require('../config/db');

const Stamp = {

  // 스탬프 적립
  async create(conn, userId, orderId) {
    const [result] = await conn.query(`
      INSERT INTO stamps
        (user_id, order_id)
      VALUES (?, ?)
    `, [userId, orderId]);
    return result.insertId;
  },

  // 내 스탬프 목록
  async findByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT
        s.stamp_id,
        s.created_at,
        o.order_number
      FROM stamps s
      JOIN orders o
      ON s.order_id = o.order_id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `, [userId]);
    return rows;
  },

  // 스탬프 개수
  async countByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS count
      FROM stamps
      WHERE user_id = ?
    `, [userId]);
    return rows[0].count;
  }
};

module.exports = Stamp;

//AI Generate:parkynh2|20260518|46|