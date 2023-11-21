const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.userProfile = catchAsync(async (req, res, next) => {
  const data = await prisma.businessUsers.findFirst({
    where: {
      id: req.body.userId,
    },
    include: {
      details: true,
    },
  });

  data.password = undefined;
  data.static_code = undefined;
  // data.acountType = undefined;
  data.complete = undefined;
  data.verified = undefined;
  data.verification = undefined;

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.upadateProfile = catchAsync(async (req, res, next) => {
  await prisma.businessUsers.update({
    where: {
      id: req.body.userId,
    },
    data: {
      fname: req.body.fname,
      lname: req.body.lname,
    },
  });

  res.status(200).json({
    status: "success",
    message: "user detail updated successfully",
  });
});

exports.upadatePassword = catchAsync(async (req, res, next) => {
  if (!req.body.password || !req.body.newpassword) {
    next(new AppError("inValid inputs", 400));
  }

  const user = await prisma.businessUsers.findUnique({
    where: {
      id: req.body.userId,
    },
  });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    next(new AppError("wrong password", 404));
  }

  req.body.newpassword = await bcrypt.hash(req.body.newpassword, 10);

  await prisma.businessUsers.update({
    where: {
      id: req.body.userId,
    },
    data: {
      password: req.body.newpassword,
    },
  });

  res.status(200).json({
    status: "success",
    message: "password updated successfully",
  });
});

exports.updateBusinessProfile = catchAsync(async (req, res, next) => {
  await prisma.businessUsers.update({
    where: {
      id: req.body.userId,
    },
    data: {
      address: req.body.location,
      companyname: req.body.businessname,
      website: req.body.website,
    },
  });

  await prisma.businessPrimaryDetails.updateMany({
    where: {
      userid: req.body.userId,
    },
    data: {
      about: req.body.about,
      colorScheme: req.body.colorScheme,
      sociallinks: JSON.stringify(req.body.socialLinks),
      about: req.body.about,
      icon: req.body.icon,
      banner: req.body.banner,
    },
  });

  res.status(200).json({
    status: "success",
    message: "password updated successfully",
  });
});