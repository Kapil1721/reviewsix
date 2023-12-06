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
  getAllListingCategory,
  getAdController,
  updateAdController,
  uploadBusinessMedia,
} = require("../../business-controller/businessProfileController");

const {
  businessReviewStats,
  businessReviewStatsCalc,
  getAllReviewsForBusinessUser,
  businessReviewReply,
  businessContact,
  getReviewOnReport,
} = require("../../business-controller/businessReviewController");
const {
  newSubscription,
  subValidator,
} = require("../../business-controller/businessSubscriptionController");

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

router
  .route("/review/stats")
  .put(validBusinessUser, businessReviewStats)
  .get(validBusinessUser, businessReviewStatsCalc);

router
  .route("/review")
  .get(validBusinessUser, getAllReviewsForBusinessUser)
  .post(validBusinessUser, businessReviewReply);

router.route("/user/updatePassword").put(validBusinessUser, upadatePassword);
router.route("/report").get(validBusinessUser, getReviewOnReport);
router.route("/user/contact").get(validBusinessUser, businessContact);
router.route("/category").get(validBusinessUser, getAllListingCategory);

router
  .route("/advertisement")
  .get(validBusinessUser, getAdController)
  .put(validBusinessUser, updateAdController);

router
  .route("/media")
  .post(validBusinessUser, subValidator, uploadBusinessMedia);

router
  .route("/subscription")
  .post(validBusinessUser, newSubscription)
  .get(validBusinessUser, subValidator);

module.exports = router;
