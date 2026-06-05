// routes/admin.js
const express    = require('express');
const router     = express.Router();
const controller =
  require('../controllers/adminController');
const auth   = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// 관리자 권한 체크 미들웨어
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '관리자만 접근 가능해요!'
    });
  }
  next();
};

// 전부 JWT + 관리자 권한 필요!

// ── 통계 ──
router.get('/stats/daily',   auth, adminOnly, controller.getDailyStats);
router.get('/stats/monthly', auth, adminOnly, controller.getMonthlyStats);
router.get('/stats/branch',  auth, adminOnly, controller.getBranchStats);
router.get('/stats/menu',    auth, adminOnly, controller.getMenuStats);

// ── 메뉴 관리 ──
router.get('/products',        auth, adminOnly, controller.getProducts);
router.post('/products',       auth, adminOnly, controller.createProduct);
router.put('/products/:id',    auth, adminOnly, controller.updateProduct);
router.delete('/products/:id', auth, adminOnly, controller.deleteProduct);
// 📌 이미지는 multipart/form-data라 upload 미들웨어를 별도로 끼워요
//    auth → adminOnly → upload.single('image') → controller 순서!
router.post('/products/:id/image', auth, adminOnly, upload.single('image'), controller.uploadProductImage);

// ── 주문 관리 ──
router.get('/orders',                  auth, adminOnly, controller.getOrders);
router.patch('/orders/:id/status',     auth, adminOnly, controller.updateOrderStatus);

module.exports = router;

//AI Generate:parkynh2|20260521|34|3eb03faa4a6b4a8fb7ba457442232074