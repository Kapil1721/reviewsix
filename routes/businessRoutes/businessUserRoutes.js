const express = require("express");
const {
  businessUserSignup,
  completePasswordVerification,
  updatedpassword,
  businessUserLogin,
} = require("../../business-controller/businessAuth");

const router = express.Router();

router.route("/signup").post(businessUserSignup);
router.route("/signin").post(businessUserLogin);
router
  .route("/check-valid-pass")
  .post(completePasswordVerification)
  .put(updatedpassword);

module.exports = router;
