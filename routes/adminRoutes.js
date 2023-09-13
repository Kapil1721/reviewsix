const express = require("express");
const {
  collectionSizeData,
  getReviewData,
  deleteReviewData,
  deleteUserData,
  getUserData,
  getListingData,
  deleteListingData,
  getBlogData,
  deleteBlogData,
  postBlogData,
  updateBlogData,
  updateStatus,
  adminClaim,
  getBlogCommentData,
} = require("../controllers/adminController");

const router = express.Router();

router.route("/size-collec").get(collectionSizeData);
router
  .route("/review/:id?")
  .get(getReviewData)
  .delete(deleteReviewData)
  .post(updateStatus);
router.route("/user/:id?").get(getUserData).delete(deleteUserData);
router.route("/listing/:id?").get(getListingData).delete(deleteListingData);
router.route("/listing/:id?").get(getListingData).delete(deleteListingData);
router
  .route("/listing/:id?")
  .get(getListingData)
  .delete(deleteListingData)
  .post(adminClaim);

router
  .route("/blog/:id?")
  .get(getBlogData)
  .delete(deleteBlogData)
  .post(postBlogData)
  .put(updateBlogData);

router.route("/blog/comment/:id").get(getBlogCommentData);

module.exports = router;
