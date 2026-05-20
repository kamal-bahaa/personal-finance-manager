const { body } = require("express-validator");

exports.createGoalValidation = [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isLength({ min: 2 }).withMessage("Title must be at least 2 characters"),

    body("targetAmount")
        .notEmpty().withMessage("Target amount is required")
        .isFloat({ min: 1 }).withMessage("Target amount must be greater than 0"),

    body("currentAmount")
        .optional()
        .isFloat({ min: 0 }).withMessage("Current amount must be 0 or greater"),

    body("deadline")
        .optional()
        .isISO8601().withMessage("Invalid date format"),

    body("notes")
        .optional()
        .isString().withMessage("Notes must be a string"),
];

exports.updateGoalValidation = [
    body("title")
        .optional()
        .isLength({ min: 2 }).withMessage("Title must be at least 2 characters"),

    body("targetAmount")
        .optional()
        .isFloat({ min: 1 }).withMessage("Target amount must be greater than 0"),

    body("currentAmount")
        .optional()
        .isFloat({ min: 0 }).withMessage("Current amount must be 0 or greater"),

    body("deadline")
        .optional()
        .isISO8601().withMessage("Invalid date format"),

    body("notes")
        .optional()
        .isString().withMessage("Notes must be a string"),
];