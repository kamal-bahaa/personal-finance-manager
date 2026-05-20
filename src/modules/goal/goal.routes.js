const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createGoalValidation, updateGoalValidation } = require("./goal.validation");
const goalController = require("./goal.controller");

router.route("/")
    .post(auth, createGoalValidation, validate, goalController.addGoal)
    .get(auth, goalController.getUserGoals);

router.route("/:id")
    .patch(auth, updateGoalValidation, validate, goalController.updateGoal)
    .delete(auth, goalController.deleteGoal);

module.exports = router;