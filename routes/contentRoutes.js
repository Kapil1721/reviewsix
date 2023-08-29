const express = require("express");
const {
  getBlogList,
  getBlogbyid,
  getBlogsuggestion,
} = require("../controllers/blogController");

const router = express.Router();

router.route("/blog").get(getBlogList);
router.route("/blog/:id").get(getBlogbyid);
router.route("/blog/suggestion/:id").get(getBlogsuggestion);

module.exports = router;
