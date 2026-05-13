const Product = require("../models/Product");

// GET /api/products
exports.list = async (req, res, next) => {
  try {
    const products = await Product.listActive();
    return res.json({
      success: true,
      products,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/products/:id
exports.detail = async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return next({ status: 400, message: "올바른 상품 ID가 아닙니다." });
    }

    const product = await Product.findById(productId);
    if (!product || Number(product.is_active) !== 1) {
      return next({ status: 404, message: "상품을 찾을 수 없습니다." });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (err) {
    return next(err);
  }
};

