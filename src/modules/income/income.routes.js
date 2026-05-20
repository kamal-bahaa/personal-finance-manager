const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createIncomeValidation, updateIncomeValidation } = require("./income.validation");
const incomeController = require("./income.controller");

router.route("/")
    .post(auth, createIncomeValidation, validate, incomeController.addIncome)
    .get(auth, incomeController.getUserIncome);

router.route("/:id")
    .patch(auth, updateIncomeValidation, validate, incomeController.updateIncome)
    .delete(auth, incomeController.deleteIncome);

module.exports = router;