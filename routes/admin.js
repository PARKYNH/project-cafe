// routes/admin.js
const express    = require('express');
const router     = express.Router();
const controller =
  require('../controllers/adminController');
const auth =
  require('../middlewares/auth');

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
router.get('/stats/daily',
  auth, adminOnly, controller.getDailyStats);

router.get('/stats/monthly',
  auth, adminOnly, controller.getMonthlyStats);

router.get('/stats/branch',
  auth, adminOnly, controller.getBranchStats);

router.get('/stats/menu',
  auth, adminOnly, controller.getMenuStats);

module.exports = router;

//AI Generate:parkynh2|20260521|34|3eb03faa4a6b4a8fb7ba457442232074