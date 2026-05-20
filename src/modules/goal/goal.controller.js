const Goal = require("../../models/goal.model");
const AppError = require("../../utils/AppError");
const asyncWrapper = require("../../utils/asyncWrapper");
const { sendSuccess } = require("../../utils/ApiResponse");

const ALLOWED_FIELDS = ["title", "targetAmount", "currentAmount", "deadline", "notes"];

exports.addGoal = asyncWrapper(async (req, res, next) => {
    const { title, targetAmount, currentAmount, deadline, notes } = req.body;

    const goal = await Goal.create({
        userId: req.user._id,
        title,
        targetAmount,
        currentAmount: currentAmount || 0,
        deadline,
        notes: notes || "",
    });

    return sendSuccess(res, 201, { goal });
});

exports.getUserGoals = asyncWrapper(async (req, res, next) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [goals, total] = await Promise.all([
        Goal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
        Goal.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, {
        goals,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    });
});

exports.updateGoal = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const updates = {};
    ALLOWED_FIELDS.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
        return next(new AppError("No valid fields to update", 400, "fail"));
    }

    const goal = await Goal.findOne({ _id: id, userId: req.user._id });
    if (!goal) return next(new AppError("Goal not found", 404, "fail"));

    Object.assign(goal, updates);
    await goal.save();

    return sendSuccess(res, 200, { goal });
});

exports.deleteGoal = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const deleted = await Goal.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!deleted) return next(new AppError("Goal not found", 404, "fail"));

    return sendSuccess(res, 200, null, "Goal deleted successfully");
});