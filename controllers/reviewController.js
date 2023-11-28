const { PrismaClient } = require("@prisma/client");
const catchAsync = require("../utils/catchAsync");
const prisma = new PrismaClient();

exports.reportReview = catchAsync(async (req, res, next) => {
  await prisma.reviewReport.create({
    data: req.body,
  });

  res.status(201).json({
    message: "success",
  });
});

exports.contactAdmin = catchAsync(async (req, res, next) => {
  req.body.question = req.body.message;
  delete req.body.message;

  console.log(req.body);

  await prisma.contactBusinessAdmin.create({
    data: req.body,
  });

  res.status(201).json({
    message: "success",
  });
});
