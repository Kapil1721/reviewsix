const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dns = require("dns");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

function checkDomainExistence(domain) {
  return new Promise((resolve, reject) => {
    dns.resolve(domain, (err) => {
      if (err) {
        if (err.code === "ENOTFOUND") {
          resolve(false);
        } else {
          reject(err);
        }
      } else {
        resolve(true);
      }
    });
  });
}

exports.businessUserSignup = catchAsync(async (req, res, next) => {
  if (req.body.website) {
    const exists = await checkDomainExistence(
      req.body.website.replace(/^(https?|ftp):\/\//, "")
    );

    if (!exists) {
      return res.status(401).json({
        message: "invalid website",
      });
    }
  }

  const varificationToken = crypto.randomBytes(24).toString("hex");

  const newUser = await prisma.businessUsers.create({
    data: {
      ...req.body,
    },
  });

  const message = `Click this URL to complete the verification process \n https://reviewsix.vercel.app/api/v1/u-verify/${varificationToken}/${newUser.id}`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Your email verification code (valid for 5 days)",
      message,
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.businessUserLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});

exports.validBusinessUser = (req, res, next) => {
  let token = req.headers["authorization"]?.split(" ")[1];

  try {
    if (!token || req.headers["authorization"]?.split(" ")[0] !== "Bearer") {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized Access. Please log in again",
      });
    }

    const isVerified = jwt.verify(token, process.env.JWT_SECRET);

    if (isVerified) {
      req.body.userId = isVerified.id;
      next();
    }
  } catch (error) {
    if (error) {
      if (
        error.message === "invalid token" ||
        error.name === "JsonWebTokenError"
      ) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized Access. Please log in again",
        });
      }
      if (
        error.message === "jwt expired" ||
        error.name === "TokenExpiredError"
      ) {
        return res.status(401).json({
          status: 401,
          message: "Session Expired. Please log in again",
        });
      }
    }

    return res.status(500).json({
      message: "Internal Server Error",
      text: "Something went wrong. Try again",
    });
  }
};

exports.updateBusinessUserPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ id: req.body.userId }).select("+password");

  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(new AppError("Incorrect password", 401));
  }

  const p = await bcrypt.hash(req.body.newpassword, 12);

  const updated = await User.findByIdAndUpdate(
    { id: req.body.userId },
    { password: p }
  );

  res.status(200).json({
    status: "success",
    updated,
  });
});
