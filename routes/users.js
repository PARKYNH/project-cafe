const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

const router = express.Router();

// 내 정보 조회 (인증 필요)
router.get("/me", auth, userController.me);

module.exports = router;

