const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const User = require("../models/user.model");
const asyncWrapper = require("../utils/asyncWrapper");

module.exports = asyncWrapper(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Access denied. No token provided.", 401, "fail"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new AppError("User no longer exists", 401, "fail"));

    req.user = user;
    next();
});