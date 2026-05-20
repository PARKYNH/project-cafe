// 스탬프 라우터

const express    = require('express');
const router     = express.Router();
const controller =
  require('../controllers/stampController');
const auth =
  require('../middlewares/auth');

// 전부 JWT 인증 필요!
router.get('/',
  auth, controller.getList);

router.get('/count',
  auth, controller.getCount);

module.exports = router;