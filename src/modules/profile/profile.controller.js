const bcrypt = require("bcrypt");
const User = require("../../models/user.model");
const Token = require("../../models/token.model");
const Expense = require("../../models/expense.model");
const Income = require("../../models/income.model");
const Goal = require("../../models/goal.model");
const Budget = require("../../models/budget.model");
const AppError = require("../../utils/AppError");
const asyncWrapper = require("../../utils/asyncWrapper");
const { sendSuccess } = require("../../utils/ApiResponse");

exports.getProfile = asyncWrapper(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return next(new AppError("User not found", 404, "fail"));

    return sendSuccess(res, 200, { user });
});

exports.updateProfile = asyncWrapper(async (req, res, next) => {
    const { name, email } = req.body;

    if (!name && !email) {
        return next(new AppError("At least one field is required", 400, "fail"));
    }

    if (email) {
        const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
        if (existing) return next(new AppError("Email already in use", 400, "fail"));
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const updated = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true }
    ).select("-password");

    return sendSuccess(res, 200, { user: updated });
});

exports.changePassword = asyncWrapper(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return next(new AppError("Current password is incorrect", 400, "fail"));

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await Token.deleteMany({ userId: req.user._id });

    return sendSuccess(res, 200, null, "Password changed successfully. Please login again.");
});

exports.deleteProfile = asyncWrapper(async (req, res, next) => {
    const userId = req.user._id;

    await Promise.all([
        Expense.deleteMany({ userId }),
        Income.deleteMany({ userId }),
        Goal.deleteMany({ userId }),
        Budget.deleteMany({ userId }),
        Token.deleteMany({ userId }),
    ]);

    await User.findByIdAndDelete(userId);

    return sendSuccess(res, 200, null, "Account deleted successfully");
});