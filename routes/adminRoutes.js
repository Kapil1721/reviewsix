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
  bulkUploaderController,
  updateListingStatus,
  deleteCategory,
  updateCateory,
  updateTopCategoryStatus,
  updateTopUserStatus,
} = require("../controllers/adminController");
const {
  blogCommentDeleteHandler,
  changeActiveStatus,
} = require("../controllers/blogController");

const router = express.Router();

router.route("/size-collec").get(collectionSizeData);
router
  .route("/review/:id?")
  .get(getReviewData)
  .delete(deleteReviewData)
  .post(updateStatus);

router
  .route("/user/:id?")
  .get(getUserData)
  .delete(deleteUserData)
  .patch(updateTopUserStatus);

router
  .route("/listing/:id?")
  .get(getListingData)
  .delete(deleteListingData)
  .patch(updateListingStatus);

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

router
  .route("/blog/comment/:id")
  .get(getBlogCommentData)
  .delete(blogCommentDeleteHandler)
  .patch(changeActiveStatus);

router
  .route("/business-category/:id?")
  .delete(deleteCategory)
  .patch(updateCateory)
  .put(updateTopCategoryStatus);

router.route("/bulk").post(bulkUploaderController);

module.exports = router;
