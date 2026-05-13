const pool = require("../config/db");

async function listActive() {
  const [rows] = await pool.query(
    `
    SELECT
      p.product_id,
      p.category_id,
      c.name AS category_name,
      p.name,
      p.description,
      p.price,
      p.image_url,
      p.is_sold_out,
      p.created_at
    FROM products p
    JOIN categories c ON c.category_id = p.category_id
    WHERE p.is_active = 1
      AND c.is_active = 1
    ORDER BY c.sort_order ASC, p.product_id ASC
    `
  );
  return rows;
}

async function findById(productId) {
  const [rows] = await pool.query(
    `
    SELECT
      p.product_id,
      p.category_id,
      c.name AS category_name,
      p.name,
      p.description,
      p.price,
      p.image_url,
      p.is_sold_out,
      p.is_active,
      p.created_at
    FROM products p
    JOIN categories c ON c.category_id = p.category_id
    WHERE p.product_id = ?
    LIMIT 1
    `,
    [productId]
  );
  return rows[0] || null;
}

module.exports = {
  listActive,
  findById,
};

