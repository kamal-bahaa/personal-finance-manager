const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createBudgetValidation, updateBudgetValidation } = require("./budget.validation");
const budgetController = require("./budget.controller");

router.route("/")
    .post(auth, createBudgetValidation, validate, budgetController.addBudget)
    .get(auth, budgetController.getBudgets);

router.get("/:month", auth, budgetController.getBudgetByMonth);

router.route("/:id")
    .patch(auth, updateBudgetValidation, validate, budgetController.updateBudget)
    .delete(auth, budgetController.deleteBudget);

module.exports = router;