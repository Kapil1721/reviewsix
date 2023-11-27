const express = require("express");
const {
  reportReview,
  contactAdmin,
} = require("../controllers/reviewController");
const { validUser } = require("../controllers/authController");

const router = express.Router();

router.route("/report").post(validUser, reportReview);
router.route("/contact").post(validUser, contactAdmin);

module.exports = router;
