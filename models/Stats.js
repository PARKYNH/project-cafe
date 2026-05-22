// models/Stats.js
const pool = require('../config/db');

const Stats = {

  // 일별 매출
  async getDailyStats() {
    const [rows] = await pool.query(`
      SELECT
        DATE(created_at) AS 날짜,
        COUNT(*)         AS 주문수,
        SUM(total_price) AS 매출
      FROM orders
      WHERE status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY 날짜 DESC
      LIMIT 30
    `);
    return rows;
  },

  // 월별 매출
  async getMonthlyStats() {
    const [rows] = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS 월,
        COUNT(*)                          AS 주문수,
        SUM(total_price)                  AS 매출
      FROM orders
      WHERE status != 'cancelled'
      GROUP BY 월
      ORDER BY 월 DESC
      LIMIT 12
    `);
    return rows;
  },

  // 지점별 매출
  async getBranchStats() {
    const [rows] = await pool.query(`
      SELECT
        b.name           AS 지점명,
        COUNT(o.order_id) AS 주문수,
        SUM(o.total_price) AS 매출
      FROM orders o
      JOIN branches b
      ON o.branch_id = b.branch_id
      WHERE o.status != 'cancelled'
      GROUP BY b.branch_id, b.name
      ORDER BY 매출 DESC
    `);
    return rows;
  },

  // 인기 메뉴
  async getMenuStats() {
    const [rows] = await pool.query(`
      SELECT
        p.name             AS 메뉴명,
        SUM(oi.quantity)   AS 주문수량,
        SUM(oi.quantity * oi.unit_price) AS 매출
      FROM order_items oi
      JOIN products p
      ON oi.product_id = p.product_id
      JOIN orders o
      ON oi.order_id = o.order_id
      WHERE o.status != 'cancelled'
      GROUP BY p.product_id, p.name
      ORDER BY 주문수량 DESC
      LIMIT 10
    `);
    return rows;
  }
};

module.exports = Stats;

//AI Generate:parkynh2|20260521|77|3eb03faa4a6b4a8fb7ba457442232074