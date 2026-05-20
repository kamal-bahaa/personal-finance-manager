const Expense = require("../../models/expense.model");
const AppError = require("../../utils/AppError");
const asyncWrapper = require("../../utils/asyncWrapper");
const { sendSuccess } = require("../../utils/ApiResponse");

const ALLOWED_FIELDS = ["title", "amount", "category", "date", "isRecurring", "notes"];

exports.addExpense = asyncWrapper(async (req, res, next) => {
    const { title, amount, category, date, isRecurring, notes } = req.body;

    const expense = await Expense.create({
        userId: req.user._id,
        title,
        amount,
        category,
        date: date || Date.now(),
        isRecurring: isRecurring || false,
        notes: notes || "",
    });

    return sendSuccess(res, 201, { expense });
});

exports.getUserExpenses = asyncWrapper(async (req, res, next) => {
    const { category, startDate, endDate, page = 1, limit = 10 } = req.query;

    const filter = { userId: req.user._id };
    if (category) filter.category = category;
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [expenses, total] = await Promise.all([
        Expense.find(filter).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
        Expense.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, {
        expenses,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    });
});

exports.updateExpense = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const updates = {};
    ALLOWED_FIELDS.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
        return next(new AppError("No valid fields to update", 400, "fail"));
    }

    const updated = await Expense.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        updates,
        { new: true }
    );

    if (!updated) return next(new AppError("Expense not found", 404, "fail"));

    return sendSuccess(res, 200, { expense: updated });
});

exports.deleteExpense = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const deleted = await Expense.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!deleted) return next(new AppError("Expense not found", 404, "fail"));

    return sendSuccess(res, 200, null, "Expense deleted successfully");
});