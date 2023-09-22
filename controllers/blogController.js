const { default: mongoose } = require("mongoose");
const blog = require("../models/blogModal");
const catchAsync = require("../utils/catchAsync");
const blogCommentModal = require("../models/blogCommentModal");
const blogCategoryModal = require("../models/blogCategory");
const footerSettingModal = require("../models/footerSettingModal");

exports.getBlogList = catchAsync(async (req, res, next) => {
  const blogList = await blog.find();
  res.status(200).json({ status: "success", data: blogList });
});

exports.getBlogbyid = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const blogList = await blog.findById(id);
  res.status(200).json({ status: "success", data: blogList });
});

exports.getBlogsuggestion = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const suggestions = await blog.aggregate([
    {
      $match: {
        _id: {
          $ne: new mongoose.Types.ObjectId(id),
        },
      },
    },
    {
      $sample: {
        size: 2,
      },
    },
  ]);

  res.status(200).json({ status: "success", data: suggestions });
});

exports.commentBlog = catchAsync(async (req, res, next) => {
  await blogCommentModal.create(req.body);

  res.status(201).json({ status: "success" });
});

exports.blogCommentDeleteHandler = catchAsync(async (req, res, next) => {
  await blogCommentModal.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "success",
  });
});

exports.changeActiveStatus = catchAsync(async (req, res, next) => {
  await blogCommentModal.findByIdAndUpdate(req.params.id, {
    active: req.body.status,
  });
  res.status(200).json({
    message: "success",
  });
});

exports.getBlogDataHandler = catchAsync(async (req, res, next) => {
  const limit = 5;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;

  let le = await blogCommentModal
    .find({
      postid: req.params.id,
      active: true,
    })
    .count();

  let data = await blogCommentModal
    .find({
      $and: [{ postid: req.params.id }, { active: true }],
    })
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  res.status(200).json({
    status: "success",
    le,
    data,
  });
});

exports.BlogCategoryInsertHandler = catchAsync(async (req, res, next) => {
  const ex = await blogCategoryModal.create(req.body);

  res.status(201).json({
    message: "new category successfully created",
    data: ex,
  });
});

exports.getBlogCategoryHandler = catchAsync(async (req, res, next) => {
  const ex = await blogCategoryModal.find();
  console.log(ex);
  res.status(200).json({
    message: "success",
    data: ex,
  });
});

exports.updateBlogCategoryHandler = catchAsync(async (req, res, next) => {
  const ex = await blogCategoryModal.findById(req.body.id);

  ex.name = req.body.name;
  await ex.save();

  res.status(200).json({
    message: "category updated successfully",
    data: ex,
  });
});

exports.deleteBlogCategoryHandler = catchAsync(async (req, res, next) => {
  await blogCategoryModal.findByIdAndDelete(req.params.id);

  res.status(204).json({
    message: "category deleted successfully",
  });
});

exports.getFooterData = catchAsync(async (req, res, next) => {
  const data = await footerSettingModal.find();
  res.status(200).json({
    message: "success",
    data,
  });
});

exports.updateFooterData = catchAsync(async (req, res, next) => {
  await footerSettingModal.findByIdAndUpdate(req.body.id, {
    content: req.body.content,
    topsearches: req.body.topsearches,
  });

  res.status(200).json({
    message: "success",
  });
});
