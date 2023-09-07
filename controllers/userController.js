const catchAsync = require("../utils/catchAsync");
const reviewModal = require("../models/reviewModal");
const User = require("../models/userModel");
const companyModal = require("../models/companyListingModal");
const sendEmail = require("../utils/email");

const fs = require("fs");

exports.getUserReviews = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * 5;

  const totalCount = await reviewModal.aggregate([
    {
      $match: { userId: req.body.userId },
    },
    {
      $count: "totalCount",
    },
  ]);

  const totalDocuments = totalCount[0] ? totalCount[0].totalCount : 0;

  const review = await reviewModal.aggregate([
    {
      $match: { userId: req.body.userId },
    },
    { $addFields: { plisting: { $toObjectId: "$listingId" } } },
    {
      $lookup: {
        from: "companylistings",
        localField: "plisting",
        foreignField: "_id",
        as: "companyDetails",
      },
    },
    {
      $unwind: "$companyDetails",
    },
    {
      $unset: "companyDetails._id",
    },
    {
      $skip: skip,
    },
    {
      $limit: 5,
    },
  ]);

  res.status(200).json({
    length: totalDocuments,
    message: "success",
    status: 200,
    data: review,
  });
});

exports.deteteUserReviews = catchAsync(async (req, res, next) => {
  const deletdReview = await reviewModal.findByIdAndDelete({
    _id: req.query.id,
  });

  res.status(200).json({
    message: "success",
    status: 200,
    data: deletdReview,
  });
});

exports.GetUserData = catchAsync(async (req, res, next) => {
  const userData = await User.findById(req.body.userId).select(
    "-_id -verification"
  );

  res.status(200).json({
    message: "success",
    status: 200,
    data: userData,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const userData = await User.findByIdAndUpdate(
    {
      _id: req.body.userId,
    },
    {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      image: req.body.image,
    }
  );

  res.status(200).json({
    message: "success",
    status: 200,
    data: userData,
  });
});

exports.getUserListing = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * 5;

  const totalCount = await companyModal.aggregate([
    {
      $match: { userId: req.body.userId },
    },
    {
      $count: "totalCount",
    },
  ]);

  const totalDocuments = totalCount[0] ? totalCount[0].totalCount : 0;

  let listingData = await companyModal.aggregate([
    {
      $match: { userId: req.body.userId },
    },
    {
      $addFields: {
        listid: {
          $toString: "$_id",
        },
      },
    },
    {
      $lookup: {
        from: "reveiws",
        localField: "listid",
        foreignField: "listingId",
        as: "reviews",
      },
    },
    {
      $addFields: {
        averageRating: { $avg: "$reviews.rating" },
        totalReviews: { $sum: { $size: "$reviews" } },
      },
    },
    {
      $unset: "reviews",
    },
    {
      $skip: skip,
    },
    {
      $limit: 5,
    },
  ]);

  res.status(200).json({
    length: totalDocuments,
    message: "success",
    status: 200,
    data: listingData,
  });
});

exports.createUserWithListing = catchAsync(async (req, res, next) => {
  let password = require("crypto").randomBytes(12).toString("hex");
  password = require("crypto")
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const code = require("crypto").randomBytes(14).toString("hex");

  const newuser = await User.create({
    email: req.body.email,
    name: req.body.email.split("@")[0],
    password,
    verified: true,
  });

  newuser.password = undefined;

  const message = `Your new account has been successfully created. Here are your account details : \n
  ,your email: ${req.body.email} and password: ${password} \n
  your verification link to verify your listing is  \n https://reviewsix.vercel.app/api/v1/company/listing/verify/${code}/${newuser._id}
  `;

  await companyModal.findOneAndUpdate(
    {
      websiteLink: req.body.email.split("@")[1],
    },
    {
      verifyCode: code,
    }
  );

  let x = fs.readFileSync(__dirname + "/emailTemp.html", "utf8");

  let y = x
    .replace("{{name}}", req.body.email.split("@")[0])
    .replace("{{email}}", req.body.email)
    .replace("{{password}}", password)
    .replace(
      "{{link}}",
      `https://reviewsix.vercel.app/api/v1/company/listing/verify/${code}/${newuser._id}`
    );

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Welcome to Software hub 360",
      message,
      html: y,
    });

    res.status(201).json({
      message: "success",
      status: 201,
    });
  } catch (err) {
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});
