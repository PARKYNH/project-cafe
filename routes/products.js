const express = require("express");
const productController = require("../controllers/productController");

const router = express.Router();

// 메뉴 목록
router.get("/", productController.list);

// 메뉴 상세
router.get("/:id", productController.detail);

module.exports = router;

