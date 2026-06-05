const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SALT_ROUNDS = 10;

function signAccessToken({ user_id, email, role }) {
  return jwt.sign(
    { user_id, email, role },  // ← role 추가!
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "1h" }
  );
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body || {};

    // 필수값 검증 (최소한의 방어 로직)
    if (!email || typeof email !== "string") {
      return next({ status: 400, message: "이메일을 입력해 주세요." });
    }
    if (!password || typeof password !== "string") {
      return next({ status: 400, message: "비밀번호를 입력해 주세요." });
    }
    if (!name || typeof name !== "string") {
      return next({ status: 400, message: "이름을 입력해 주세요." });
    }
    if (password.length < 8) {
      return next({
        status: 400,
        message: "비밀번호는 8자 이상으로 설정해 주세요.",
      });
    }

    // 이미 가입된 이메일인지 확인
    const exists = await User.findByEmail(email);
    if (exists) {
      return next({ status: 409, message: "이미 사용 중인 이메일입니다." });
    }

    // 비밀번호 해시(bcrypt) 저장
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = await User.createUser({
      email,
      passwordHash,
      name,
      phone,
    });

    return res.status(201).json({
      success: true,
      user: {
        user_id: userId,
        email,
        name,
        phone: phone || null,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== "string") {
      return next({ status: 400, message: "이메일을 입력해 주세요." });
    }
    if (!password || typeof password !== "string") {
      return next({ status: 400, message: "비밀번호를 입력해 주세요." });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return next({ status: 401, message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }
    if (Number(user.is_active) !== 1) {
      return next({ status: 403, message: "비활성화된 계정입니다." });
    }
    if (user.social_type !== "none") {
      return next({ status: 400, message: "소셜 로그인 계정입니다." });
    }
    if (!user.password) {
      return next({ status: 401, message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return next({ status: 401, message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const accessToken = signAccessToken({
      user_id: user.user_id,
      email  : user.email,
      role   : user.role,  // ← role 추가!
    });

    return res.json({
      success     : true,
      accessToken,
      role        : user.role,
      name        : user.name,
    });
  } catch (err) {
    return next(err);
  }
};

