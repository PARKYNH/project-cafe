// controllers/adminController.js
const Stats = require('../models/Stats');
const pool  = require('../config/db');
const fs    = require('fs');
const path  = require('path');

const adminController = {

  // GET /api/admin/stats/daily
  async getDailyStats(req, res, next) {
    try {
      const data = await Stats.getDailyStats();
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      return next(err);
    }
  },

  // GET /api/admin/stats/monthly
  async getMonthlyStats(req, res, next) {
    try {
      const data = await Stats.getMonthlyStats();
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      return next(err);
    }
  },

  // GET /api/admin/stats/branch
  async getBranchStats(req, res, next) {
    try {
      const data = await Stats.getBranchStats();
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      return next(err);
    }
  },

  // GET /api/admin/stats/menu
  async getMenuStats(req, res, next) {
    try {
      const data = await Stats.getMenuStats();
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      return next(err);
    }
  },

  // ───── 메뉴 관리 ─────

  // GET /api/admin/products (비활성 포함 전체 목록)
  async getProducts(req, res, next) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, c.name AS category_name
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        ORDER BY p.product_id ASC
      `);
      return res.json({ success: true, data: rows });
    } catch (err) {
      return next(err);
    }
  },

  // POST /api/admin/products (메뉴 등록)
  async createProduct(req, res, next) {
    try {
      const { category_id, name, description, price, image_url } = req.body;
      if (!category_id || !name || !price) {
        return res.status(400).json({
          success: false,
          message: '카테고리, 이름, 가격은 필수예요!'
        });
      }
      const [result] = await pool.query(
        `INSERT INTO products (category_id, name, description, price, image_url)
         VALUES (?, ?, ?, ?, ?)`,
        [category_id, name, description || null, price, image_url || null]
      );
      return res.status(201).json({
        success: true,
        message: '메뉴가 등록됐어요!',
        product_id: result.insertId
      });
    } catch (err) {
      return next(err);
    }
  },

  // PUT /api/admin/products/:id (메뉴 수정)
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const { category_id, name, description, price, image_url, is_sold_out, is_active } = req.body;

      const fields = [];
      const values = [];

      if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id); }
      if (name        !== undefined) { fields.push('name = ?');        values.push(name); }
      if (description !== undefined) { fields.push('description = ?'); values.push(description); }
      if (price       !== undefined) { fields.push('price = ?');       values.push(price); }
      if (image_url   !== undefined) { fields.push('image_url = ?');   values.push(image_url); }
      if (is_sold_out !== undefined) { fields.push('is_sold_out = ?'); values.push(is_sold_out); }
      if (is_active   !== undefined) { fields.push('is_active = ?');   values.push(is_active); }

      if (fields.length === 0) {
        return res.status(400).json({ success: false, message: '수정할 항목이 없어요!' });
      }

      values.push(id);
      const [result] = await pool.query(
        `UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: '해당 메뉴가 없어요!' });
      }
      return res.json({ success: true, message: '메뉴가 수정됐어요!' });
    } catch (err) {
      return next(err);
    }
  },

  // DELETE /api/admin/products/:id (메뉴 비활성화 - soft delete)
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const [result] = await pool.query(
        `UPDATE products SET is_active = 0 WHERE product_id = ?`,
        [id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: '해당 메뉴가 없어요!' });
      }
      return res.json({ success: true, message: '메뉴가 비활성화됐어요!' });
    } catch (err) {
      return next(err);
    }
  },

  // ───── 주문 관리 ─────

  // GET /api/admin/orders (전체 주문 목록)
  async getOrders(req, res, next) {
    try {
      const [rows] = await pool.query(`
        SELECT o.*, u.name AS user_name, u.email, b.name AS branch_name
        FROM orders o
        JOIN users    u ON o.user_id    = u.user_id
        JOIN branches b ON o.branch_id  = b.branch_id
        ORDER BY o.created_at DESC
        LIMIT 100
      `);
      return res.json({ success: true, data: rows });
    } catch (err) {
      return next(err);
    }
  },

  // POST /api/admin/products/:id/image (메뉴 이미지 업로드)
  //
  // 📌 왜 만드나요?
  //   메뉴 수정(PUT)과 이미지 업로드를 분리한 이유:
  //   일반 PUT은 JSON Body를 받고, 이미지는 multipart/form-data를 받아요.
  //   형식이 달라서 별도 엔드포인트로 분리하는 게 RESTful 표준이에요.
  //
  // 🔧 동작 순서
  //   multer 미들웨어 → 파일 저장 → req.file 주입
  //   → DB image_url 업데이트 → 기존 파일 삭제
  async uploadProductImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: '이미지 파일을 첨부해주세요!' });
      }

      const { id } = req.params;
      const imageUrl = `/uploads/${req.file.filename}`;

      // 기존 이미지 파일 삭제 (서버 디스크 낭비 방지)
      const [[product]] = await pool.query(
        'SELECT image_url FROM products WHERE product_id = ?', [id]
      );
      if (product?.image_url?.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', product.image_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // DB image_url 업데이트
      await pool.query(
        'UPDATE products SET image_url = ? WHERE product_id = ?',
        [imageUrl, id]
      );

      return res.json({
        success  : true,
        message  : '이미지가 업로드됐어요!',
        image_url: imageUrl
      });
    } catch (err) {
      return next(err);
    }
  },

  // PATCH /api/admin/orders/:id/status (주문 상태 변경)
  async updateOrderStatus(req, res, next) {
    try {
      const { id }     = req.params;
      const { status } = req.body;

      const allowed = ['pending', 'paid', 'making', 'ready', 'done', 'cancelled'];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `상태값이 올바르지 않아요! (${allowed.join(', ')})`
        });
      }

      const [result] = await pool.query(
        `UPDATE orders SET status = ? WHERE order_id = ?`,
        [status, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: '해당 주문이 없어요!' });
      }
      return res.json({ success: true, message: `주문 상태가 '${status}'로 변경됐어요!` });
    } catch (err) {
      return next(err);
    }
  }
};

module.exports = adminController;

//AI Generate:parkynh2|20260521|60|3eb03faa4a6b4a8fb7ba457442232074