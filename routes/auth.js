const express = require("express");
const authController  = require("../controllers/authController");
const kakaoController = require("../controllers/kakaoController");

const router = express.Router();

// 일반 회원가입 / 로그인
router.post("/register", authController.register);
router.post("/login",    authController.login);

// 카카오 소셜 로그인
router.get("/kakao",          kakaoController.redirect);   // → 카카오 인증 페이지
router.get("/kakao/callback", kakaoController.callback);   // ← 카카오 콜백

module.exports = router;

