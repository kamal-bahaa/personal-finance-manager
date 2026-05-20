const { body } = require("express-validator");

const VALID_CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Other"];

exports.createBudgetValidation = [
    body("month")
        .notEmpty().withMessage("Month is required")
        .matches(/^\d{4}-\d{2}$/).withMessage("Month must be in YYYY-MM format"),

    body("categories")
        .optional()
        .isObject().withMessage("Categories must be an object"),

    body("categories.*")
        .optional()
        .isFloat({ min: 0 }).withMessage("Category budget must be 0 or greater"),
];

exports.updateBudgetValidation = [
    body("categories")
        .notEmpty().withMessage("Categories are required")
        .isObject().withMessage("Categories must be an object"),

    body("categories.*")
        .optional()
        .isFloat({ min: 0 }).withMessage("Category budget must be 0 or greater"),
];