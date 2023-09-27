const express = require("express");
const {
  createCompanyListing,
  reviewPostHandler,
  getReviewHandler,
  claimListingHandler,
  RegNewListing,
  verifiyListingConfirmation,
  findRegCompany,
  updateListing,
  listingByCateController,
  getCategoryReviews,
  ListingSearch,
  getReviewByCategory,
  replyUserReviews,
} = require("../controllers/listingController");
const { validUser } = require("../controllers/authController");

const router = express.Router();

router.route("/listing").put(createCompanyListing);

router
  .route("/listing/review")
  .put(validUser, reviewPostHandler)
  .get(getReviewHandler)
  .patch(validUser, replyUserReviews);

router.route("/listing/add").put(validUser, RegNewListing);

router.route("/listing/search/:id").get(listingByCateController);

router.route("/listing/type-x/:id").get(ListingSearch);

router.route("/listing/ca/:id").get(getCategoryReviews);

router.route("/listing/find/:id").get(validUser, findRegCompany);

router.route("/listing/upd-listing").post(validUser, updateListing);

router.route("/listing/claim").post(validUser, claimListingHandler);

router.route("/listing/verify/:vcode/:uid").get(verifiyListingConfirmation);

router.route("/listing/review/:id").get(getReviewByCategory);

module.exports = router;
