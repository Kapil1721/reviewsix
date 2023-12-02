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

  await prisma.contactBusinessAdmin.create({
    data: req.body,
  });

  res.status(201).json({
    message: "success",
  });
});

exports.topReviews = catchAsync(async (req, res, next) => {
  const data =
    await prisma.$queryRaw`SELECT name,image FROM users WHERE isTOP = 1 `;

  res.status(200).json({
    message: "success",
    data,
  });
});
