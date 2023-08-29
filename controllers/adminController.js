const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const companyModal = require("../models/companyListingModal");
const blog = require("../models/blogModal");
const reviewModal = require("../models/reviewModal");

exports.collectionSizeData = catchAsync(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $group: {
        _id: {
          $cond: {
            if: "$verified",
            then: "verified",
            else: "unverified",
          },
        },
        total: { $count: {} },
      },
    },
    {
      $sort: { total: 1 },
    },
  ]);

  const listings = await companyModal.aggregate([
    {
      $group: {
        _id: {
          $cond: {
            if: "$status",
            then: "claimed",
            else: "unclaimed",
          },
        },
        total: { $count: {} },
      },
    },
    {
      $sort: { total: 1 },
    },
  ]);

  const blogs = await blog.count();

  const reviews = await reviewModal.count();

  res.status(200).json({
    message: "success",
    data: {
      listings,
      users,
      blogs,
      reviews,
    },
  });
});

//  - ----- review

exports.getReviewData = catchAsync(async (req, res, next) => {
  const reviews = await reviewModal.aggregate([
    {
      $addFields: {
        uid: { $toObjectId: "$userId" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "uid",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
  ]);

  res.status(200).json({
    message: "success",
    reviews,
  });
});

exports.deleteReviewData = catchAsync(async (req, res, next) => {
  await reviewModal.findOneAndDelete({ _id: req.params.id });

  res.status(204).json({
    message: "review deleted successfully",
  });
});

//  - ----- user

exports.getUserData = catchAsync(async (req, res, next) => {
  const data = await User.find();

  res.status(200).json({
    message: "success",
    data,
  });
});

exports.deleteUserData = catchAsync(async (req, res, next) => {
  await User.findOneAndDelete({ _id: req.params.id });

  res.status(204).json({
    message: "user deleted successfully",
  });
});

//  - ----- listing

exports.getListingData = catchAsync(async (req, res, next) => {
  const reviews = await companyModal.aggregate([
    {
      $addFields: {
        uid: { $toObjectId: "$userId" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "uid",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unset: "user.password",
    },
  ]);

  res.status(200).json({
    message: "success",
    length: reviews.length,
    reviews,
  });
});

exports.deleteListingData = catchAsync(async (req, res, next) => {
  await companyModal.findOneAndDelete({ _id: req.params.id });

  res.status(204).json({
    message: "listing deleted successfully",
  });
});

//  - ----- blog

exports.getBlogData = catchAsync(async (req, res, next) => {
  const data = await blog.find();

  res.status(200).json({
    message: "success",
    data,
  });
});

exports.postBlogData = catchAsync(async (req, res, next) => {
  await blog.create(req.body);

  res.status(201).json({
    message: "blog created successfully",
  });
});

exports.updateBlogData = catchAsync(async (req, res, next) => {
  console.log(req.params.id);

  const data = await blog.findOne({
    _id: req.params.id,
  });

  data.title = req.body.title;
  data.description = req.body.description;
  data.image = req.body.image;
  data.metaTitle = req.body.metaTitle;
  data.metaDescription = req.body.metaDescription;
  data.metaKeywords = req.body.metaKeywords;

  await data.save();

  res.status(201).json({
    message: "blog deleted successfully",
  });
});

exports.deleteBlogData = catchAsync(async (req, res, next) => {
  await blog.findOneAndDelete({ _id: req.params.id });

  res.status(204).json({
    message: "blog deleted successfully",
  });
});
