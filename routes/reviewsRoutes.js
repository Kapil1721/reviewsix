const express = require("express");
const { reportReview } = require("../controllers/reviewController");
const { validUser } = require("../controllers/authController");

const router = express.Router();

router.route("/report").post(validUser, reportReview);

module.exports = router;
