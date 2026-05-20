const Budget = require("../../models/budget.model");
const AppError = require("../../utils/AppError");
const asyncWrapper = require("../../utils/asyncWrapper");
const { sendSuccess } = require("../../utils/ApiResponse");

const VALID_CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Other"];

exports.addBudget = asyncWrapper(async (req, res, next) => {
    const { month, categories } = req.body;

    if (categories) {
        const invalidKeys = Object.keys(categories).filter(
            key => !VALID_CATEGORIES.includes(key)
        );
        if (invalidKeys.length > 0) {
            return next(new AppError(`Invalid categories: ${invalidKeys.join(", ")}`, 400, "fail"));
        }
    }

    const exists = await Budget.findOne({ userId: req.user._id, month });
    if (exists) {
        return next(new AppError("Budget already exists for this month", 400, "fail"));
    }

    const budget = await Budget.create({
        userId: req.user._id,
        month,
        categories,
    });

    return sendSuccess(res, 201, { budget });
});

exports.getBudgets = asyncWrapper(async (req, res, next) => {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ month: -1 });

    return sendSuccess(res, 200, { budgets });
});

exports.getBudgetByMonth = asyncWrapper(async (req, res, next) => {
    const { month } = req.params;

    const budget = await Budget.findOne({ userId: req.user._id, month });
    if (!budget) return next(new AppError("Budget not found for this month", 404, "fail"));

    return sendSuccess(res, 200, { budget });
});

exports.updateBudget = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { categories } = req.body;

    if (categories) {
        const invalidKeys = Object.keys(categories).filter(
            key => !VALID_CATEGORIES.includes(key)
        );
        if (invalidKeys.length > 0) {
            return next(new AppError(`Invalid categories: ${invalidKeys.join(", ")}`, 400, "fail"));
        }
    }

    const updateData = {};
    if (categories) {
        for (const key in categories) {
            updateData[`categories.${key}`] = categories[key];
        }
    }

    const updated = await Budget.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        updateData,
        { new: true }
    );

    if (!updated) return next(new AppError("Budget not found", 404, "fail"));

    return sendSuccess(res, 200, { budget: updated });
});

exports.deleteBudget = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const deleted = await Budget.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!deleted) return next(new AppError("Budget not found", 404, "fail"));

    return sendSuccess(res, 200, null, "Budget deleted successfully");
});