const mongoose = require("mongoose");
const Expense = require("../../models/expense.model");
const Income = require("../../models/income.model");
const Budget = require("../../models/budget.model");
const AppError = require("../../utils/AppError");
const asyncWrapper = require("../../utils/asyncWrapper");
const { sendSuccess } = require("../../utils/ApiResponse");

exports.monthlySummary = asyncWrapper(async (req, res, next) => {
    const { month } = req.query;

    if (!month) {
        return next(new AppError("month query is required e.g. ?month=2025-01", 400, "fail"));
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
        return next(new AppError("Invalid month format. Use YYYY-MM", 400, "fail"));
    }

    const [year, mon] = month.split("-").map(Number);
    const start = new Date(Date.UTC(year, mon - 1, 1));
    const end = new Date(Date.UTC(year, mon, 1));

    const userId = new mongoose.Types.ObjectId(req.user._id);

    const [expenseAgg, incomeAgg, budgetDoc] = await Promise.all([
        Expense.aggregate([
            { $match: { userId, date: { $gte: start, $lt: end } } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } }
        ]),
        Income.aggregate([
            { $match: { userId, date: { $gte: start, $lt: end } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        Budget.findOne({ userId: req.user._id, month }).lean(),
    ]);

    const spentByCategory = {};
    let totalExpenses = 0;
    expenseAgg.forEach(item => {
        spentByCategory[item._id] = item.total;
        totalExpenses += item.total;
    });

    const totalIncome = incomeAgg[0]?.total ?? 0;
    const budgetCategories = budgetDoc?.categories ?? {};

    const allCategories = new Set([
        ...Object.keys(spentByCategory),
        ...Object.keys(budgetCategories),
    ]);

    let totalBudget = 0;
    const categories = [];

    allCategories.forEach(cat => {
        const limit = budgetCategories[cat] ?? 0;
        const spent = spentByCategory[cat] ?? 0;

        totalBudget += limit;

        categories.push({
            category: cat,
            limit,
            spent,
            remaining: Math.max(limit - spent, 0),
            isOverBudget: limit > 0 && spent > limit,
            usedPercent: limit > 0
                ? Math.round((spent / limit) * 100)
                : spent > 0 ? 100 : 0,
        });
    });

    return sendSuccess(res, 200, {
        month,
        totalIncome,
        totalExpenses,
        totalBudget,
        balance: totalIncome - totalExpenses,
        remainingBudget: Math.max(totalBudget - totalExpenses, 0),
        categories,
    });
});