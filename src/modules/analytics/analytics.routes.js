const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const analyticsController = require("./analytics.controller");

router.get("/yearly-trend", auth, analyticsController.yearlyTrend);
router.get("/expense-category", auth, analyticsController.expenseByCategory);
router.get("/monthly-spending", auth, analyticsController.monthlySpending);
router.get("/top-categories", auth, analyticsController.topCategories);
router.get("/biggest-expense", auth, analyticsController.biggestExpense);
router.get("/income-source", auth, analyticsController.incomeBySource);

module.exports = router;