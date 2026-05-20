const { body } = require("express-validator");

exports.createExpenseValidation = [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isLength({ min: 2 }).withMessage("Title must be at least 2 characters"),

    body("amount")
        .notEmpty().withMessage("Amount is required")
        .isFloat({ min: 0.01 }).withMessage("Amount must be greater than 0"),

    body("category")
        .optional()
        .isIn(["Food", "Transport", "Shopping", "Bills", "Other"])
        .withMessage("Invalid category"),

    body("date")
        .optional()
        .isISO8601().withMessage("Invalid date format"),

    body("isRecurring")
        .optional()
        .isBoolean().withMessage("isRecurring must be a boolean"),

    body("notes")
        .optional()
        .isString().withMessage("Notes must be a string"),
];

exports.updateExpenseValidation = [
    body("title")
        .optional()
        .isLength({ min: 2 }).withMessage("Title must be at least 2 characters"),

    body("amount")
        .optional()
        .isFloat({ min: 0.01 }).withMessage("Amount must be greater than 0"),

    body("category")
        .optional()
        .isIn(["Food", "Transport", "Shopping", "Bills", "Other"])
        .withMessage("Invalid category"),

    body("date")
        .optional()
        .isISO8601().withMessage("Invalid date format"),

    body("isRecurring")
        .optional()
        .isBoolean().withMessage("isRecurring must be a boolean"),

    body("notes")
        .optional()
        .isString().withMessage("Notes must be a string"),
];