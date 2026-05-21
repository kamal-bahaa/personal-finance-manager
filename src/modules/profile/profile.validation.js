const { body } = require("express-validator");

exports.updateProfileValidation = [
    body("name")
        .optional()
        .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),

    body("email")
        .optional()
        .isEmail().withMessage("Valid email is required")
        .normalizeEmail(),
];

exports.changePasswordValidation = [
    body("currentPassword")
        .notEmpty().withMessage("Current password is required"),

    body("newPassword")
        .isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),

    body("confirmPassword")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),
];