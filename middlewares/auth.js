const jwt = require("jsonwebtoken");

// JWT 인증 미들웨어
// - Authorization: Bearer <token> 헤더를 검증합니다.
// - 검증 성공 시 req.user에 { user_id, email }을 주입합니다.
module.exports = function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return next({ status: 401, message: "인증 토큰이 필요합니다." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 토큰에 담긴 사용자 식별 정보를 request에 붙여서 이후 로직에서 사용합니다.
    req.user = {
      user_id: payload.user_id,
      email: payload.email,
    };

    return next();
  } catch (err) {
    return next({ status: 401, message: "유효하지 않은 토큰입니다." });
  }
};

