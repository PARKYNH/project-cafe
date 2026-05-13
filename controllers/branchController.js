const Branch = require("../models/Branch");

// GET /api/branches
exports.list = async (req, res, next) => {
  try {
    const branches = await Branch.listActive();
    return res.json({
      success: true,
      branches,
    });
  } catch (err) {
    return next(err);
  }
};

