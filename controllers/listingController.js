const companyModal = require("../models/companyListingModal");
const reviewModal = require("../models/reviewModal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");

const ObjectId = require("mongodb").ObjectId;

const natural = require("natural");

exports.createCompanyListing = catchAsync(async (req, res, next) => {
  const isListed = await companyModal.findOne({
    websiteLink: req.body.websiteLink,
  });

  if (isListed) {
    res.status(200).json({
      message: "success",
      status: 200,
      data: isListed,
    });
  } else {
    const newListing = await companyModal.create(req.body);

    res.status(200).json({
      message: "success",
      status: 200,
      data: newListing,
    });
  }
});

exports.reviewPostHandler = catchAsync(async (req, res, next) => {
  const review = await reviewModal.create(req.body);

  res.status(201).json({
    message: "success",
    status: 201,
    data: review,
  });
});

exports.getReviewHandler = catchAsync(async (req, res, next) => {
  const review = await reviewModal.aggregate([
    {
      $match: {
        listingId: req.query.id,
        active: true,
      },
    },
    {
      $addFields: {
        newuserid: { $toObjectId: "$userId" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "newuserid",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $unset: [
        "user._id",
        "user.password",
        "user.verified",
        "user.verification",
        "user.createAt",
        "user.email",
      ],
    },
  ]);

  res.status(200).json({
    message: "success",
    status: 200,
    data: review,
  });
});

exports.claimListingHandler = catchAsync(async (req, res, next) => {
  const code = require("crypto").randomBytes(14).toString("hex");
  const message = `your verification link \n https://reviewsix.vercel.app/api/v1/company/listing/verify/${code}/${req.body.userId}`;

  const review = await companyModal.findByIdAndUpdate(
    {
      _id: req.body.id,
    },
    {
      verifyCode: code,
    }
  );

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Your email verification code",
      message,
    });

    res.status(200).json({
      message: "success",
      status: 200,
      data: review,
    });
  } catch (err) {
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.RegNewListing = catchAsync(async (req, res, next) => {
  const isListed = await companyModal.findOne({
    websiteLink: req.body.websiteLink,
  });

  if (isListed) {
    res.status(403).json({
      message: "company already listed",
      status: 403,
      data: isListed,
    });
  } else {
    const newListing = await companyModal.create(req.body);

    res.status(200).json({
      message: "success",
      status: 200,
      data: newListing,
    });
  }
});

exports.findRegCompany = catchAsync(async (req, res, next) => {
  const listing = await companyModal.findOne({ _id: req.params.id });

  res.status(200).json({
    message: "success",
    status: 200,
    data: listing,
  });
});

exports.updateListing = catchAsync(async (req, res, next) => {
  const listing = await companyModal.findOneAndUpdate(
    { _id: req.body.id },
    {
      about: req.body.about,
      address: req.body.address,
      categoryId: req?.body?.categoryId?.toLowerCase(),
      companyName: req.body.companyName,
      email: req.body.email,
      logo: req.body.logo,
      phone: req.body.phone,
      city: req.body.city,
      pincode: req.body.pincode,
      physical: req.body.physical,
    }
  );

  res.status(200).json({
    message: "success",
    status: 200,
    data: listing,
  });
});

exports.verifiyListingConfirmation = catchAsync(async (req, res, next) => {
  const isList = await companyModal.findOne({
    verifyCode: req.params.vcode,
    status: false,
  });

  if (isList) {
    await companyModal.findOneAndUpdate(
      {
        verifyCode: req.params.vcode,
      },
      {
        status: true,
        userId: req.params.uid,
      }
    );

    res.send("<h3>verification complete check your account</h3>");
  } else {
    res.send("<p style='text-align:center;color:red;'>Link expire .....</p>");
  }
});

exports.listingByCateController = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * 8;

  const data = await companyModal.aggregate([
    {
      $match: {
        $or: [{ categoryId: req.params.id }],
      },
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
        totalReviews: { $size: "$reviews" },
      },
    },
    {
      $unset: "reviews",
    },
    {
      $limit: 8,
    },
    {
      $skip: skip,
    },
  ]);

  let size = await companyModal.aggregate([
    {
      $match: {
        $or: [{ categoryId: req.params.id }, { subcategoryid: req.params.id }],
      },
    },
    {
      $count: "size",
    },
  ]);

  res.status(200).json({
    message: "success",
    length: size[0]?.size || 0,
    data,
  });
});

exports.getCategoryReviews = catchAsync(async (req, res, next) => {
  const data = await companyModal.aggregate([
    {
      $match: {
        $or: [{ categoryId: req.params.id }, { websiteLink: req.params.id }],
      },
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
      $project: {
        _id: 0,
        reviews: 1,
        websiteLink: 1,
        logo: 1,
      },
    },
    { $unwind: "$reviews" },
    {
      $sample: {
        size: 8,
      },
    },
  ]);

  res.status(200).json({
    message: "success",
    data,
  });
});

exports.getReviewByCategory = catchAsync(async (req, res, err) => {
  const data = await companyModal.aggregate([
    {
      $match: { categoryId: req.params.id },
    },
    {
      $addFields: {
        i: { $toString: "$_id" },
      },
    },
    {
      $lookup: {
        from: "reveiws",
        localField: "i",
        foreignField: "listingId",
        as: "reviews",
      },
    },
    {
      $project: {
        reviews: 1,
        websiteLink: 1,
        logo: 1,
        _id: 0,
      },
    },
    {
      $unwind: "$reviews",
    },
  ]);

  res.status(200).json({
    message: "success",
    data,
  });
});

exports.replyUserReviews = catchAsync(async (req, res, err) => {
  await reviewModal.findOneAndUpdate(
    { _id: req.body.id },
    {
      $push: {
        response: {
          reply: req.body.reply,
          date: Date.now(),
        },
      },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: "success",
  });
});

exports.ListingSearch = catchAsync(async (req, res, next) => {
  const searchQuery = req.params.id;

  const allDocuments = await companyModal.find({});
  const results = [];

  const tokenizer = new natural.WordTokenizer();
  const queryTokens = tokenizer.tokenize(searchQuery.toLowerCase());

  allDocuments.forEach((doc) => {
    const titleTokens = tokenizer.tokenize(
      doc.websiteLink.split(".")[0].toLowerCase()
    );
    const titleScore = calculateSimilarityScore(queryTokens, titleTokens);

    if (titleScore > 0.5) {
      results.push(doc);
    }
  });
  const top5Results = results.slice(0, 5);

  res.status(200).json({
    message: "success",
    results: top5Results,
  });
});

function calculateSimilarityScore(queryTokens, documentTokens) {
  const score = queryTokens.reduce((totalScore, queryToken) => {
    const tokenScores = documentTokens.map(
      (documentToken) =>
        1 -
        natural.LevenshteinDistance(queryToken, documentToken) /
          Math.max(queryToken.length, documentToken.length)
    );

    return totalScore + Math.max(...tokenScores);
  }, 0);

  return score / queryTokens.length;
}
