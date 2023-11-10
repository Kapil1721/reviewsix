const express = require("express");
const {
  businessUserSignup,
  completePasswordVerification,
  updatedpassword,
  businessUserLogin,
  validBusinessUser,
} = require("../../business-controller/businessAuth");

const {
  userProfile,
  upadateProfile,
  upadatePassword,
} = require("../../business-controller/businessProfileController");

const router = express.Router();

router.route("/signup").post(businessUserSignup);
router.route("/signin").post(businessUserLogin);
router
  .route("/check-valid-pass")
  .post(completePasswordVerification)
  .put(updatedpassword);

router
  .route("/user")
  .get(validBusinessUser, userProfile)
  .put(validBusinessUser, upadateProfile);

router.route("/user/updatePassword").put(validBusinessUser, upadatePassword);

module.exports = router;
