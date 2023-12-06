const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const currentDate = new Date();
const futureDate = new Date();

futureDate.setDate(currentDate.getDate() + 30);

const isoFormattedCurrentDate = currentDate.toISOString();
const isoFormattedFutureDate = futureDate.toISOString();

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

exports.subValidator = catchAsync(async (req, res, next) => {
  const premium = await prisma.premiumUser.findFirst({
    where: {
      userId: req.body.userId,
    },
  });

  if (!premium) {
    return res.status(200).json({
      data: {
        m69_sub: false,
      },
    });
  }

  const data = await prisma.subscription.findFirst({
    where: { id: premium.subscriptionId },
  });

  if (!data) {
    return res.status(200).json({
      data: {
        m69_sub: false,
      },
    });
  }

  if (premium.currentPlanEnd < currentDate) {
    return res.status(200).json({
      data: {
        m69_sub: false,
        p69_d: "expire",
      },
    });
  }

  if (req.query.notb_69) {
    return res.status(200).json({
      data: {
        m69_sub: true,
      },
    });
  } else {
    next();
  }
});

// ---------------------------------------

exports.newSubscription = catchAsync(async (req, res, next) => {
  const data = await prisma.subscription.create({
    data: {
      userId: req.body.userId,
      listingid: req.body.listingid,
      paymentId: req.body.userId,
    },
  });

  req.body.subscriptionId = data.id;
  req.body.planActive = true;
  req.body.currentPlanStart = isoFormattedCurrentDate;
  req.body.currentPlanEnd = isoFormattedFutureDate;

  await prisma.premiumUser.create({
    data: req.body,
  });

  await prisma.businessAdvertisement.create({
    data: {
      userId: req.body.userId,
      listingid: req.body.listingid,
    },
  });

  res.status(201).json({
    message: "success",
  });
});
