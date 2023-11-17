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
  updateBusinessProfile,
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
  .put(validBusinessUser, upadateProfile)
  .patch(validBusinessUser, updateBusinessProfile);

router.route("/user/updatePassword").put(validBusinessUser, upadatePassword);

module.exports = router;
