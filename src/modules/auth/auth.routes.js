const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { registerValidation, loginValidation } = require("./auth.validation");
const authController = require("./auth.controller");

router.post("/register", registerValidation, validate, authController.register);
router.post("/login", loginValidation, validate, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", auth, authController.logout);

module.exports = router;