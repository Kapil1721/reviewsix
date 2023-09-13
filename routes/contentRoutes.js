const express = require("express");
const {
  getBlogList,
  getBlogbyid,
  getBlogsuggestion,
  commentBlog,
} = require("../controllers/blogController");

const router = express.Router();

router.route("/blog").get(getBlogList);
router.route("/blog/:id").get(getBlogbyid);
router.route("/blog/suggestion/:id").get(getBlogsuggestion);
router.route("/blog/comment").put(commentBlog);

module.exports = router;
