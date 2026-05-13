const express = require("express");
const branchController = require("../controllers/branchController");

const router = express.Router();

// 지점 목록
router.get("/", branchController.list);

module.exports = router;

