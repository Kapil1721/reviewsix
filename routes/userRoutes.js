const express = require("express");
const {
  userLogin,
  userSignup,
  validUser,
  updatePassword,
  verifyUserLink,
} = require("../controllers/authController");
const {
  getUserReviews,
  deteteUserReviews,
  GetUserData,
  updateUserData,
  getUserListing,
} = require("../controllers/userController");
const router = express.Router();

router.route("/signup").post(userSignup);
router.route("/login").post(userLogin);
router.route("/updatePassword").post(validUser, updatePassword);
router.route("/u-verify/:vcode/:uid").get(verifyUserLink);

// ----------------------------------

router
  .route("/user/reviews")
  .get(validUser, getUserReviews)
  .delete(validUser, deteteUserReviews);

router
  .route("/user")
  .get(validUser, GetUserData)
  .post(validUser, updateUserData);

router.route("/b-listing").get(validUser, getUserListing);

module.exports = router;
