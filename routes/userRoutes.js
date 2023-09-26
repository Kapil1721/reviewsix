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
  createUserWithListing,
  reviewStats,
  ListingStats,
  deleteUserListing,
  getTopRatingUser,
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

router.route("/user-l").post(createUserWithListing);
router
  .route("/b-listing/:id?")
  .get(validUser, getUserListing)
  .delete(validUser, deleteUserListing);

router.route("/top-reviewers").get(getTopRatingUser);

router.route("/review-stats").get(validUser, reviewStats);
router.route("/business-stats").get(validUser, ListingStats);

module.exports = router;
