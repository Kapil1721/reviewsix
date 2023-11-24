const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.businessReviewStats = catchAsync(async (req, res, err) => {
  console.log(req.body);
  const businessId = req.body.userId;

  const reviewCounts = await prisma.review.groupBy({
    by: ["active"],
    _count: {
      _all: true,
    },
    where: {
      matrix: businessId,
    },
  });

  const stats = {};
  for (const { active, _count } of reviewCounts) {
    stats[active] = _count._all;
  }

  res.status(200).json({
    message: "Success",
    status: 200,
    data: stats,
  });
});

exports.businessReviewStatsCalc = catchAsync(async (req, res, err) => {
  const businessId = req.body.userId;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const currentMonthReviews = await prisma.review.count({
    where: {
      matrix: businessId,
      createdAt: {
        gte: new Date(`${currentYear}-${currentMonth}-01`),
        lt: new Date(`${currentYear}-${currentMonth + 1}-01`),
      },
    },
  });

  const previousMonthReviews = await prisma.review.count({
    where: {
      matrix: businessId,
      createdAt: {
        gte: new Date(`${previousYear}-${previousMonth}-01`),
        lt: new Date(`${previousYear}-${previousMonth + 1}-01`),
      },
    },
  });

  const total = await prisma.review.count({
    where: {
      matrix: businessId,
    },
  });

  const percentageChange =
    previousMonthReviews !== 0
      ? ((currentMonthReviews - previousMonthReviews) / previousMonthReviews) *
        100
      : 100;

  res.status(200).json({
    currentMonthReviews,
    previousMonthReviews,
    percentageChange,
    total,
  });
});

exports.getAllReviewsForBusinessUser = catchAsync(async (req, res, err) => {
  let filter = { createdAt: "desc" };
  let modifier = { matrix: req.body.userId };

  if (req.query.sort) {
    delete filter.createdAt;
    filter.rating = req.query.sort === "lth" ? "asc" : "desc";
  } else {
    filter.createdAt = "desc";
  }

  if (req.query.filter) {
    modifier.active = JSON.parse(req.query.filter);
  }

  const page = req.query.page || 1;
  const limit = 5;
  const skip = limit * (page - 1);

  const reviews = await prisma.review.findMany({
    skip: skip,
    take: limit,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      ...filter,
    },
    where: {
      ...modifier,
    },
  });

  const total = await prisma.review.count({
    orderBy: {
      ...filter,
    },
    where: {
      ...modifier,
    },
  });

  res.status(200).json({
    message: "success",
    reviews,
    total,
  });
});

exports.businessReviewReply = catchAsync(async (req, res, err) => {
  await prisma.review.updateMany({
    where: {
      id: req.body.id,
    },
    data: {
      reply: req.body.reply,
    },
  });

  res.status(200).json({
    message: "success",
  });
});
