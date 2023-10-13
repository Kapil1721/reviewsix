const companyModal = require("../models/companyListingModal");
const reviewModal = require("../models/reviewModal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");

const natural = require("natural");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createCompanyListing = catchAsync(async (req, res, next) => {
  const existingListing = await prisma.companyListing.findFirst({
    where: {
      websiteLink: req.body.websiteLink,
    },
  });

  if (existingListing) {
    res.status(200).json({
      message: "success",
      status: 200,
      data: existingListing,
    });
  } else {
    const newListing = await prisma.companyListing.create({
      data: req.body,
    });

    res.status(200).json({
      message: "success",
      status: 200,
      data: newListing,
    });
  }
});

exports.reviewPostHandler = catchAsync(async (req, res, next) => {
  const review = await prisma.review.create({
    data: req.body,
  });

  res.status(201).json({
    message: "success",
    status: 201,
    data: review,
  });
});

exports.getReviewHandler = catchAsync(async (req, res, next) => {
  const reviews = await prisma.review.findMany({
    where: {
      listingId: req.query.id,
      active: true,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    message: "success",
    status: 200,
    data: reviews,
  });
});

exports.claimListingHandler = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const code = require("crypto").randomBytes(14).toString("hex");
  const message = `your verification link \n https://reviewsix.vercel.app/api/v1/company/listing/verify/${code}/${req.body.userId}`;

  const review = await prisma.companyListing.update({
    where: {
      id: req.body.id,
    },
    data: {
      verifyCode: code,
    },
  });

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
  const isListed = await prisma.companyListing.findFirst({
    where: {
      websiteLink: req.body.websiteLink,
    },
  });

  if (isListed) {
    res.status(403).json({
      message: "company already listed",
      status: 403,
      data: isListed,
    });
  } else {
    const newListing = await prisma.companyListing.create({
      data: { ...req.body },
    });

    res.status(200).json({
      message: "success",
      status: 200,
      data: newListing,
    });
  }
});

exports.findRegCompany = catchAsync(async (req, res, next) => {
  const listing = await prisma.companyListing.findFirst({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).json({
    message: "success",
    status: 200,
    data: listing,
  });
});

exports.updateListing = catchAsync(async (req, res, next) => {
  const updatedListing = await prisma.companyListing.update({
    where: {
      id: req.body.id,
    },
    data: {
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
    },
  });

  res.status(200).json({
    message: "success",
    status: 200,
    data: updatedListing,
  });
});

exports.verifiyListingConfirmation = catchAsync(async (req, res, next) => {
  const isList = await prisma.companyListing.findFirst({
    where: {
      verifyCode: req.params.vcode,
      status: false,
    },
  });

  if (isList) {
    await prisma.companyListing.updateMany({
      where: {
        verifyCode: req.params.vcode,
      },
      data: {
        status: true,
        userId: req.params.uid,
      },
    });

    res.send("<h3>verification complete check your account</h3>");
  } else {
    res.send("<p style='text-align:center;color:red;'>Link expire .....</p>");
  }
});

exports.listingByCateController = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * 8;

  req.params.id = req.params.id.replaceAll("-", " ");

  const data = await prisma.$queryRaw`
  SELECT
    c.*,
    CAST(AVG(r.rating) AS DECIMAL(10, 2)) AS averageRating,
    CAST(COUNT(r.id) AS DECIMAL(10, 0)) AS totalReviews
  FROM
    company_listings c
  LEFT JOIN
    reviews r ON c.id = r.listingId
  WHERE
    c.categoryId = ${req.params.id}
  GROUP BY
    c.id
  LIMIT
    8
  OFFSET
    ${skip};
`;

  const size = await prisma.$queryRaw`
  SELECT
    COUNT(id) AS size
  FROM
  company_listings
  WHERE
    categoryId = ${req.params.id};
`;

  function toJson(data) {
    return JSON.stringify(data, (_, v) =>
      typeof v === "bigint" ? `${v}n` : v
    ).replace(/"(-?\d+)n"/g, (_, a) => a);
  }

  res.status(200).json({
    message: "success",
    length: +toJson(size[0].size) || 0,
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
          $toString: "$id",
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
        id: 0,
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
  let data = await prisma.companyListing.findMany({
    where: {
      categoryId: req.params.id,
    },
    include: {
      Review: true,
    },
  });

  data = data
    .flatMap((e) =>
      e.Review.map((l) => ({ ...l, websiteLink: e.websiteLink, logo: e.logo }))
    )

    .filter((e) => e.active === true);

  res.status(200).json({
    message: "success",
    data,
  });
});

exports.replyUserReviews = catchAsync(async (req, res, err) => {
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

exports.lisingCategory = catchAsync(async (req, res, err) => {
  const page = req.query.page || 1;
  const limit = 18;
  const skip = limit * (page - 1);
  const patter =
    req.query.filter && req.query.filter.length === 1 ? req.query.filter : "A";

  const filterQuery = req.query.filter ? { title: { startsWith: patter } } : {};

  let data;
  if (!req.query.puchi) {
    data = await prisma.category.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        title: "asc",
      },
      where: {
        ...filterQuery,
      },
    });
  } else {
    data = await prisma.category.findMany({});
  }

  const length = await prisma.category.count({
    where: {
      ...filterQuery,
    },
  });

  res.status(200).json({
    message: "success",
    data,
    length,
  });
});

exports.getTopCategory = catchAsync(async (req, res, err) => {
  const data = await prisma.category.findMany({
    where: {
      onTop: true,
    },
  });

  res.status(200).json({
    message: "success",
    data,
  });
});

exports.ListingSearch = catchAsync(async (req, res, next) => {
  const searchQuery = req.params.id.toLowerCase();
  const allDocuments = await prisma.companyListing.findMany();
  const results = [];
  const queryTokens = searchQuery.split(" ");
  for (const doc of allDocuments) {
    const titleTokens = doc.websiteLink.split(".")[0].toLowerCase().split(" ");
    const titleScore = calculateSimilarityScore(queryTokens, titleTokens);
    if (titleScore > 0.5) {
      results.push(doc);
    }
  }
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
