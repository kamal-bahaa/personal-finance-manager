const Income = require("../../models/income.model");
const AppError = require("../../utils/AppError");
const asyncWrapper = require("../../utils/asyncWrapper");
const { sendSuccess } = require("../../utils/ApiResponse");

const ALLOWED_FIELDS = ["title", "amount", "source", "date", "notes"];

exports.addIncome = asyncWrapper(async (req, res, next) => {
    const { title, amount, source, date, notes } = req.body;

    const income = await Income.create({
        userId: req.user._id,
        title,
        amount,
        source,
        date: date || Date.now(),
        notes: notes || "",
    });

    return sendSuccess(res, 201, { income });
});

exports.getUserIncome = asyncWrapper(async (req, res, next) => {
    const { source, startDate, endDate, page = 1, limit = 10 } = req.query;

    const filter = { userId: req.user._id };
    if (source) filter.source = source;
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [incomeList, total] = await Promise.all([
        Income.find(filter).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
        Income.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, {
        income: incomeList,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    });
});

exports.updateIncome = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const updates = {};
    ALLOWED_FIELDS.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
        return next(new AppError("No valid fields to update", 400, "fail"));
    }

    const updated = await Income.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        updates,
        { new: true }
    );

    if (!updated) return next(new AppError("Income not found", 404, "fail"));

    return sendSuccess(res, 200, { income: updated });
});

exports.deleteIncome = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const deleted = await Income.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!deleted) return next(new AppError("Income not found", 404, "fail"));

    return sendSuccess(res, 200, null, "Income deleted successfully");
});