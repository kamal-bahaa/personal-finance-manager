const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const summaryController = require("./summary.controller");

router.get("/monthly", auth, summaryController.monthlySummary);

module.exports = router;