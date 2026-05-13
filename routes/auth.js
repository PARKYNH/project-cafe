const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// 회원가입
router.post("/register", authController.register);

// 로그인 (Access Token 발급)
router.post("/login", authController.login);

module.exports = router;

