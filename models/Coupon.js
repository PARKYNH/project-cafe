// 쿠폰 DAO

const pool = require('../config/db');

const Coupon = {

  // 쿠폰 생성
  async create(conn, userId) {
    // 쿠폰 코드 생성
    const code = 'CPN-' +
      Date.now() + '-' +
      Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

    // 유효기간 30일
    const expiredAt = new Date();
    expiredAt.setDate(
      expiredAt.getDate() + 30
    );

    const [result] = await conn.query(`
      INSERT INTO coupons
        (user_id, coupon_code, expired_at)
      VALUES (?, ?, ?)
    `, [userId, code, expiredAt]);

    return { couponId: result.insertId, code };
  },

  // 내 쿠폰 목록
  async findByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT
        coupon_id,
        coupon_code,
        status,
        created_at,
        expired_at,
        used_at
      FROM coupons
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);
    return rows;
  },

  // 쿠폰 코드로 조회
  async findByCode(couponCode, userId) {
    const [rows] = await pool.query(`
      SELECT *
      FROM coupons
      WHERE coupon_code = ?
      AND user_id = ?
    `, [couponCode, userId]);
    return rows[0];
  },

  // 쿠폰 사용
  async use(conn, couponId) {
    const [result] = await conn.query(`
      UPDATE coupons
      SET status  = 'used',
          used_at = NOW()
      WHERE coupon_id = ?
      AND status = 'active'
      AND expired_at > NOW()
    `, [couponId]);
    return result.affectedRows;
  }
};

module.exports = Coupon;

//AI Generate:parkynh2|20260518|75|051dc92653c045aea417098c60c2bbd6