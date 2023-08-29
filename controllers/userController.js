const catchAsync = require("../utils/catchAsync");
const reviewModal = require("../models/reviewModal");
const User = require("../models/userModel");
const companyModal = require("../models/companyListingModal");

exports.getUserReviews = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * 5;

  const totalCount = await reviewModal.aggregate([
    {
      $match: { userId: req.body.userId },
    },
    {
      $count: "totalCount",
    },
  ]);

  const totalDocuments = totalCount[0] ? totalCount[0].totalCount : 0;

  const review = await reviewModal.aggregate([
    {
      $match: { userId: req.body.userId },
    },
    { $addFields: { plisting: { $toObjectId: "$listingId" } } },
    {
      $lookup: {
        from: "companylistings",
        localField: "plisting",
        foreignField: "_id",
        as: "companyDetails",
      },
    },
    {
      $unwind: "$companyDetails",
    },
    {
      $unset: "companyDetails._id",
    },
    {
      $skip: skip,
    },
    {
      $limit: 5,
    },
  ]);

  res.status(200).json({
    length: totalDocuments,
    message: "success",
    status: 200,
    data: review,
  });
});

exports.deteteUserReviews = catchAsync(async (req, res, next) => {
  const deletdReview = await reviewModal.findByIdAndDelete({
    _id: req.query.id,
  });

  res.status(200).json({
    message: "success",
    status: 200,
    data: deletdReview,
  });
});

exports.GetUserData = catchAsync(async (req, res, next) => {
  const userData = await User.findById(req.body.userId).select(
    "-_id -verification"
  );

  res.status(200).json({
    message: "success",
    status: 200,
    data: userData,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const userData = await User.findByIdAndUpdate(
    {
      _id: req.body.userId,
    },
    {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      image: req.body.image,
    }
  );

  res.status(200).json({
    message: "success",
    status: 200,
    data: userData,
  });
});

exports.getUserListing = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * 5;

  const totalCount = await companyModal.aggregate([
    {
      $match: { userId: req.body.userId },
    },
    {
      $count: "totalCount",
    },
  ]);

  const totalDocuments = totalCount[0] ? totalCount[0].totalCount : 0;

  let listingData = await companyModal.aggregate([
    {
      $match: { userId: req.body.userId },
    },
    {
      $addFields: {
        listid: {
          $toString: "$_id",
        },
      },
    },
    {
      $lookup: {
        from: "reveiws",
        localField: "listid",
        foreignField: "listingId",
        as: "reviews",
      },
    },
    {
      $addFields: {
        averageRating: { $avg: "$reviews.rating" },
        totalReviews: { $sum: { $size: "$reviews" } },
      },
    },
    {
      $unset: "reviews",
    },
    {
      $limit: 5,
    },
    {
      $skip: skip,
    },
  ]);

  res.status(200).json({
    length: totalDocuments,
    message: "success",
    status: 200,
    data: listingData,
  });
});
