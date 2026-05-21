const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { updateProfileValidation, changePasswordValidation } = require("./profile.validation");
const profileController = require("./profile.controller");

router.get("/", auth, profileController.getProfile);
router.patch("/", auth, updateProfileValidation, validate, profileController.updateProfile);
router.patch("/password", auth, changePasswordValidation, validate, profileController.changePassword);
router.delete("/", auth, profileController.deleteProfile);

module.exports = router;