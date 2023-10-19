const express = require("express");
const {
  businessUserSignup,
} = require("../../business-controller/businessAuth");

const router = express.Router();

router.route("/signup").post(businessUserSignup);

module.exports = router;
