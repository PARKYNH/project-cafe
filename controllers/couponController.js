const Coupon = require('../models/Coupon');
const pool   = require('../config/db');

const couponController = {

  async getList(req, res, next) {
    try {
      const userId  = req.user?.user_id;
      const coupons = await Coupon.findByUserId(userId);
      return res.json({
        success: true,
        coupons
      });
    } catch (err) {
      return next(err);
    }
  },

  async use(req, res, next) {
    let conn;
    try {
      const userId         = req.user?.user_id;
      const { couponCode } = req.body;

      if (!couponCode) {
        return next({ status: 400, message: '쿠폰 코드를 입력해주세요.' });
      }

      const coupon = await Coupon.findByCode(couponCode, userId);

      if (!coupon) {
        return next({ status: 404, message: '쿠폰을 찾을 수 없어요.' });
      }

      if (coupon.status !== 'active') {
        return next({ status: 400, message: '이미 사용됐거나 만료된 쿠폰이에요.' });
      }

      if (new Date(coupon.expired_at) < new Date()) {
        return next({ status: 400, message: '만료된 쿠폰이에요.' });
      }

      conn = await pool.getConnection();
      await conn.beginTransaction();

      const affected = await Coupon.use(conn, coupon.coupon_id);

      if (affected === 0) {
        await conn.rollback();
        return next({ status: 400, message: '쿠폰 사용에 실패했어요.' });
      }

      await conn.commit();

      return res.json({
        success: true,
        message: '쿠폰이 사용됐어요!',
        data   : { couponCode }
      });

    } catch (err) {
      if (conn) await conn.rollback();
      return next(err);
    } finally {
      if (conn) conn.release();
    }
  }

};

module.exports = couponController;
