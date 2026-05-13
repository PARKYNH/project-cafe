const User = require("../models/User");

// GET /api/users/me (인증 필요)
exports.me = async (req, res, next) => {
  try {
    // auth 미들웨어가 토큰을 검증하고 req.user를 주입합니다.
    const userId = req.user?.user_id;
    if (!userId) {
      return next({ status: 401, message: "인증 정보가 없습니다." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return next({ status: 404, message: "사용자를 찾을 수 없습니다." });
    }
    if (Number(user.is_active) !== 1) {
      return next({ status: 403, message: "비활성화된 계정입니다." });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    return next(err);
  }
};

