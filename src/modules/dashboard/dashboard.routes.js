const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const dashboardController = require("./dashboard.controller");

router.get("/overview", auth, dashboardController.overview);

module.exports = router;