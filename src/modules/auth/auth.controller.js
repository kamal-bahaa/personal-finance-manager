const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const Token = require("../../models/token.model");
const AppError = require("../../utils/AppError");
const asyncWrapper = require("../../utils/asyncWrapper");
const { sendSuccess } = require("../../utils/ApiResponse");

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    });
};

exports.register = asyncWrapper(async (req, res, next) => {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
        return next(new AppError("Email already registered", 400, "fail"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    return sendSuccess(res, 201, {
        user: { id: user._id, name: user.name, email: user.email },
    }, "Account created successfully");
});

exports.login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new AppError("Invalid email or password", 401, "fail"));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new AppError("Invalid email or password", 401, "fail"));

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await Token.create({ userId: user._id, token: refreshToken, expiresAt });

    return sendSuccess(res, 200, {
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email },
    });
});

exports.refresh = asyncWrapper(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new AppError("Refresh token is required", 400, "fail"));
    }

    const stored = await Token.findOne({ token: refreshToken });
    if (!stored) return next(new AppError("Invalid refresh token", 401, "fail"));

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const accessToken = generateAccessToken(decoded.id);

    return sendSuccess(res, 200, { accessToken });
});

exports.logout = asyncWrapper(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        await Token.deleteOne({ token: refreshToken });
    }

    return sendSuccess(res, 200, null, "Logged out successfully");
});