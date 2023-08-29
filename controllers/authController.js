const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.userSignup = catchAsync(async (req, res, next) => {
  const varificationToken = crypto.randomBytes(24).toString("hex");

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    verification: varificationToken,
    createdAt: Date.now(),
  });

  const message = `Click this url to complete the verification process \n http://localhost:8000/api/v1/u-verify/verify/${varificationToken}/${newUser._id}`;

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

exports.userLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});

exports.validUser = (req, res, next) => {
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

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.body.userId }).select("+password");

  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(new AppError("Incorrect password", 401));
  }

  const p = await bcrypt.hash(req.body.newpassword, 12);

  const updated = await User.findByIdAndUpdate(
    { _id: req.body.userId },
    { password: p }
  );

  res.status(200).json({
    status: "success",
    updated,
  });
});

exports.verifyUserLink = catchAsync(async (req, res, next) => {
  const isUser = await User.findOne({
    _id: req.params.uid,
    verification: req.params.vcode,
    verified: false,
  });

  if (isUser) {
    await User.findOneAndUpdate(
      {
        _id: req.params.uid,
      },
      {
        verified: true,
      }
    );

    res.send(`<h3 style='text-align:center;'>Verification complete</h3>`);
  } else {
    res.send(`<p style='text-align:center;color:red;'>Link expired ...</p>`);
  }
});
