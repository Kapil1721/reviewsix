const { default: mongoose } = require("mongoose");
const blog = require("../models/blogModal");
const catchAsync = require("../utils/catchAsync");
const blogCommentModal = require("../models/blogCommentModal");

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
  console.log(req.body);
  await blogCommentModal.create(req.body);

  res.status(201).json({ status: "success" });
});
