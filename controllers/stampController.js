const Stamp  = require('../models/Stamp');
const Coupon = require('../models/Coupon');
const pool   = require('../config/db');

const STAMP_PER_COUPON = 10;

const stampController = {

  async getList(req, res, next) {
    try {
      const userId = req.user?.user_id;
      const stamps = await Stamp.findByUserId(userId);
      return res.json({
        success: true,
        stamps
      });
    } catch (err) {
      return next(err);
    }
  },

  async getCount(req, res, next) {
    try {
      const userId = req.user?.user_id;
      const count  = await Stamp.countByUserId(userId);

      // count 0일 때 예외처리!
      const remaining = count === 0
        ? STAMP_PER_COUPON
        : STAMP_PER_COUPON - (count % STAMP_PER_COUPON);

      return res.json({
        success: true,
        data: {
          stampCount  : count,
          nextCouponIn: remaining,
          message     : remaining === STAMP_PER_COUPON
            ? `쿠폰까지 ${STAMP_PER_COUPON}개 남았어요!`
            : remaining === 0
              ? '쿠폰 발급 가능해요!'
              : `쿠폰까지 ${remaining}개 남았어요!`
        }
      });
    } catch (err) {
      return next(err);
    }
  }

};

module.exports = stampController;
