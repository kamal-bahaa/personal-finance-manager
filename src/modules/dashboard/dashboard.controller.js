const mongoose = require("mongoose");
const Expense = require("../../models/expense.model");
const Income = require("../../models/income.model");
const Goal = require("../../models/goal.model");
const asyncWrapper = require("../../utils/asyncWrapper");
const { sendSuccess } = require("../../utils/ApiResponse");

exports.overview = asyncWrapper(async (req, res, next) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();

    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 1));

    const [expensesAgg, incomeAgg, goals, recentExpenses, recentIncome] = await Promise.all([
        Expense.aggregate([
            { $match: { userId, date: { $gte: start, $lt: end } } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]),
        Income.aggregate([
            { $match: { userId, date: { $gte: start, $lt: end } } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]),
        Goal.find({ userId: req.user._id }),
        Expense.find({ userId: req.user._id }).sort({ date: -1 }).limit(5).lean(),
        Income.find({ userId: req.user._id }).sort({ date: -1 }).limit(5).lean(),
    ]);

    const totalExpenses = expensesAgg[0]?.total ?? 0;
    const totalIncome = incomeAgg[0]?.total ?? 0;

    const completedGoals = goals.filter(g => g.status === "completed").length;

    const recentTransactions = [
        ...recentExpenses.map(e => ({ ...e, type: "expense" })),
        ...recentIncome.map(i => ({ ...i, type: "income" })),
    ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    return sendSuccess(res, 200, {
        overview: {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            incomeCount: incomeAgg[0]?.count ?? 0,
            expenseCount: expensesAgg[0]?.count ?? 0,
            goalsCount: goals.length,
            completedGoals,
        },
        recentTransactions,
    });
});