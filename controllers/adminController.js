const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const companyModal = require("../models/companyListingModal");
const blog = require("../models/blogModal");
const reviewModal = require("../models/reviewModal");
const blogCommentModal = require("../models/blogCommentModal");

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
    { $sort: { date: -1 } },
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
  const data = User.find();

  const sorted = await data.sort("-createdAt");

  res.status(200).json({
    message: "success",
    data: sorted,
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
    { $sort: { date: -1 } },
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
  console.log(req.body);
  await blog.create(req.body);

  res.status(201).json({
    message: "blog created successfully",
  });
});

exports.updateBlogData = catchAsync(async (req, res, next) => {
  const data = await blog.findOne({
    _id: req.params.id,
  });

  data.title = req.body.title;
  data.description = req.body.description;
  data.image = req.body.image;
  data.metaTitle = req.body.metaTitle;
  data.metaDescription = req.body.metaDescription;
  data.metaKeywords = req.body.metaKeywords;
  data.alt = req.body.alt;
  data.category = req.body.category;
  data.tags = req.body.tags;
  data.table = req.body.table;
  data.faq = req.body.faq;

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

exports.updateStatus = catchAsync(async (req, res, next) => {
  await reviewModal.findByIdAndUpdate(
    { _id: req.body.id },
    { status: req.body.status }
  );

  res.status(200).json({
    message: "status updated",
  });
});

exports.getBlogCommentData = catchAsync(async (req, res, next) => {
  const data = await blogCommentModal
    .find({ postid: req.params.id })
    .sort({ date: -1 });

  res.status(200).json({
    message: "success",
    data,
  });
});

exports.adminClaim = catchAsync(async (req, res, next) => {
  let x = await companyModal.findByIdAndUpdate(
    { _id: req.body.id },
    { status: req.body.status, userId: null }
  );

  res.status(200).json({
    message: "status updated",
  });
});
