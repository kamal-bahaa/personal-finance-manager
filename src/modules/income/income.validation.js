const { body } = require("express-validator");

exports.createIncomeValidation = [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isLength({ min: 2 }).withMessage("Title must be at least 2 characters"),

    body("amount")
        .notEmpty().withMessage("Amount is required")
        .isFloat({ min: 0.01 }).withMessage("Amount must be greater than 0"),

    body("source")
        .optional()
        .isIn(["Salary", "Freelance", "Business", "Investment", "Other"])
        .withMessage("Invalid source"),

    body("date")
        .optional()
        .isISO8601().withMessage("Invalid date format"),

    body("notes")
        .optional()
        .isString().withMessage("Notes must be a string"),
];

exports.updateIncomeValidation = [
    body("title")
        .optional()
        .isLength({ min: 2 }).withMessage("Title must be at least 2 characters"),

    body("amount")
        .optional()
        .isFloat({ min: 0.01 }).withMessage("Amount must be greater than 0"),

    body("source")
        .optional()
        .isIn(["Salary", "Freelance", "Business", "Investment", "Other"])
        .withMessage("Invalid source"),

    body("date")
        .optional()
        .isISO8601().withMessage("Invalid date format"),

    body("notes")
        .optional()
        .isString().withMessage("Notes must be a string"),
];