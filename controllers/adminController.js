// controllers/adminController.js
const Stats = require('../models/Stats');

const adminController = {

  // GET /api/admin/stats/daily
  async getDailyStats(req, res, next) {
    try {
      const data = await Stats.getDailyStats();
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      return next(err);
    }
  },

  // GET /api/admin/stats/monthly
  async getMonthlyStats(req, res, next) {
    try {
      const data = await Stats.getMonthlyStats();
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      return next(err);
    }
  },

  // GET /api/admin/stats/branch
  async getBranchStats(req, res, next) {
    try {
      const data = await Stats.getBranchStats();
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      return next(err);
    }
  },

  // GET /api/admin/stats/menu
  async getMenuStats(req, res, next) {
    try {
      const data = await Stats.getMenuStats();
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      return next(err);
    }
  }
};

module.exports = adminController;

//AI Generate:parkynh2|20260521|60|3eb03faa4a6b4a8fb7ba457442232074