// 쿠폰 라우터

const express    = require('express');
const router     = express.Router();
const controller =
  require('../controllers/couponController');
const auth =
  require('../middlewares/auth');

router.get('/',
  auth, controller.getList);

router.post('/use',
  auth, controller.use);

module.exports = router;