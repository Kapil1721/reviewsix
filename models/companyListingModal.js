const mongoose = require("mongoose");

const companyListing = new mongoose.Schema({
  userId: {
    type: String,
    default: null,
  },
  companyName: {
    type: String,
    default: null,
  },
  categoryId: {
    type: String,
    default: null,
  },
  logo: {
    type: String,
    default: null,
  },
  websiteLink: {
    type: String,
    required: [true, "Website Link is required"],
  },
  about: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  verifyCode: {
    type: String,
    default: null,
  },
  status: {
    type: Boolean,
    default: false,
  },
});

companyListing.pre("save", function (next) {
  if (this.categoryId) {
    this.categoryId = this.categoryId.toLowerCase();
    this.subcategoryid = this.subcategoryid.toLowerCase();

    next();
  } else {
    next();
  }
});

const companyModal = new mongoose.model("companyListing", companyListing);

module.exports = companyModal;
