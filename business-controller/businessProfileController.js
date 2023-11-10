const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.userProfile = catchAsync(async (req, res, next) => {
  const data = await prisma.businessUsers.findFirst({
    where: {
      id: "56d6d26b-19aa-4202-bc37-93f164da35ab",
    },
  });

  data.password = undefined;
  data.static_code = undefined;
  data.acountType = undefined;
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
