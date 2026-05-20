const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createExpenseValidation, updateExpenseValidation } = require("./expense.validation");
const expenseController = require("./expense.controller");

router.route("/")
    .post(auth, createExpenseValidation, validate, expenseController.addExpense)
    .get(auth, expenseController.getUserExpenses);

router.route("/:id")
    .patch(auth, updateExpenseValidation, validate, expenseController.updateExpense)
    .delete(auth, expenseController.deleteExpense);

module.exports = router;