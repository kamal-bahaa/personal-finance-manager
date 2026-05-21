const mongoose = require("mongoose");
const Expense = require("../../models/expense.model");
const Income = require("../../models/income.model");
const asyncWrapper = require("../../utils/asyncWrapper");
const { sendSuccess } = require("../../utils/ApiResponse");

exports.yearlyTrend = asyncWrapper(async (req, res, next) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const year = parseInt(req.query.year) || new Date().getUTCFullYear();

    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    const [expenses, incomes] = await Promise.all([
        Expense.aggregate([
            { $match: { userId, date: { $gte: start, $lt: end } } },
            {
                $group: {
                    _id: { month: { $month: { date: "$date", timezone: "UTC" } } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.month": 1 } }
        ]),
        Income.aggregate([
            { $match: { userId, date: { $gte: start, $lt: end } } },
            {
                $group: {
                    _id: { month: { $month: { date: "$date", timezone: "UTC" } } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.month": 1 } }
        ]),
    ]);

    return sendSuccess(res, 200, { year, expenses, incomes });
});

exports.expenseByCategory = asyncWrapper(async (req, res, next) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const data = await Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } }
    ]);

    return sendSuccess(res, 200, { data });
});

exports.monthlySpending = asyncWrapper(async (req, res, next) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const data = await Expense.aggregate([
        { $match: { userId } },
        {
            $group: {
                _id: {
                    year: { $year: { date: "$date", timezone: "UTC" } },
                    month: { $month: { date: "$date", timezone: "UTC" } }
                },
                total: { $sum: "$amount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    return sendSuccess(res, 200, { data });
});

exports.topCategories = asyncWrapper(async (req, res, next) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const limit = parseInt(req.query.limit) || 5;

    const data = await Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
        { $limit: limit }
    ]);

    return sendSuccess(res, 200, { data });
});

exports.biggestExpense = asyncWrapper(async (req, res, next) => {
    const expense = await Expense.findOne({ userId: req.user._id })
        .sort({ amount: -1 });

    return sendSuccess(res, 200, { expense: expense || null });
});

exports.incomeBySource = asyncWrapper(async (req, res, next) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const data = await Income.aggregate([
        { $match: { userId } },
        { $group: { _id: "$source", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } }
    ]);

    return sendSuccess(res, 200, { data });
});