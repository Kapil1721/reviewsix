const catchAsync = require("../utils/catchAsync");
const fs = require("fs");
const sendEmail = require("../utils/email");
const AppError = require("../utils/appError");

const { PrismaClient } = require("@prisma/client");
const { error } = require("console");
const prisma = new PrismaClient();

exports.collectionSizeData = catchAsync(async (req, res, next) => {
  const users = await prisma.$queryRaw`SELECT
  CASE
    WHEN verified = 1 THEN 'verified'
    ELSE 'unverified'
  END AS id,
  CAST(COUNT(*) AS DECIMAL(10,2)) AS total
FROM users
GROUP BY
  CASE
    WHEN verified = 1 THEN 'verified'
    ELSE 'unverified'
  END
ORDER BY total ASC;`;

  const listings = await prisma.$queryRaw`
      SELECT CASE WHEN
      status
          = 1 THEN 'claimed' ELSE 'unclaimed'
      END AS id,
      CAST(COUNT(*) AS  DECIMAL(10,2)) AS total
      FROM
          company_listings
      GROUP BY CASE WHEN
          status = 1 THEN 'claimed' ELSE 'unclaimed'
      END
      ORDER BY
          total ASC;`;

  const blogs = await prisma.blog.count();
  const reviews = await prisma.review.count();

  res.status(200).json({
    message: "success",
    data: {
      listings,
      users,
      blogs,
      reviews,
    },
  });
});

//  - ----- review

exports.getReviewData = catchAsync(async (req, res, next) => {
  const reviews = await prisma.review.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  res.status(200).json({
    message: "success",
    reviews,
  });
});

exports.deleteReviewData = catchAsync(async (req, res, next) => {
  const review = await prisma.review.findFirst({
    where: {
      id: req.params.id,
    },
  });

  const user = await prisma.user.findFirst({
    where: {
      id: review.userId,
    },
  });

  const businessDetails = await prisma.businessPrimaryDetails.findFirst({
    where: {
      id: review.listingId,
    },
  });

  const company = await prisma.businessUsers.findFirst({
    where: {
      id: businessDetails.userid,
    },
  });

  await prisma.review.delete({
    where: {
      id: req.params.id,
    },
  });

  const message = ``;

  let x = fs.readFileSync(__dirname + "/reviewRemove.html", "utf8");

  let y = x
    .replace("{{name}}", review.name)
    .replace("{{company}}", company.companyname);

  try {
    await sendEmail({
      email: user.email,
      subject: `${review.name}, your review has been removed`,
      message,
      html: y,
    });

    res.status(204).json({
      message: "review deleted successfully",
    });
  } catch (err) {
    console.log(error);
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

//  - ----- user

exports.getUserData = catchAsync(async (req, res, next) => {
  const data = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    message: "success",
    data,
  });
});

exports.deleteUserData = catchAsync(async (req, res, next) => {
  await prisma.user.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(204).json({
    message: "user deleted successfully",
  });
});

//  - ----- listing

exports.getListingData = catchAsync(async (req, res, next) => {
  const reviews = await prisma.$queryRaw`  SELECT 
  *,
  users.name,
  users.email,
  users.phone,
  users.address
FROM 
  company_listings 
LEFT JOIN
  users
ON
  company_listings.userId = users.id
ORDER BY
  company_listings.date DESC;
`;

  res.status(200).json({
    message: "success",
    length: reviews.length,
    reviews,
  });
});

exports.deleteListingData = catchAsync(async (req, res, next) => {
  await prisma.companyListing.delete({ where: { id: req.params.id } });

  res.status(204).json({
    message: "listing deleted successfully",
  });
});

//  - ----- blog

exports.getBlogData = catchAsync(async (req, res, next) => {
  const data = await prisma.blog.findMany();

  res.status(200).json({
    message: "success",
    data,
  });
});

exports.postBlogData = catchAsync(async (req, res, next) => {
  await prisma.blog.create({ data: req.body });

  res.status(201).json({
    message: "blog created successfully",
  });
});

exports.updateBlogData = catchAsync(async (req, res, next) => {
  await prisma.blog.updateMany({
    where: { id: req.params.id },
    data: {
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      metaKeywords: req.body.metaKeywords,
      alt: req.body.alt,
      category: req.body.category,
      tags: req.body.tags,
      table: req.body.table,
      faq: req.body.faq,
    },
  });

  res.status(201).json({
    message: "blog deleted successfully",
  });
});

exports.deleteBlogData = catchAsync(async (req, res, next) => {
  await prisma.blog.deleteMany({ id: req.params.id });

  res.status(204).json({
    message: "blog deleted successfully",
  });
});

exports.updateStatus = catchAsync(async (req, res, next) => {
  await prisma.review.updateMany({
    where: { id: req.body.id },
    data: { active: req.body.status },
  });

  const review = await prisma.review.findFirst({
    where: {
      id: req.body.id,
    },
  });

  console.log(review);

  const user = await prisma.user.findFirst({
    where: {
      id: review.userId,
    },
  });

  const businessDetails = await prisma.businessPrimaryDetails.findFirst({
    where: {
      id: review.listingId,
    },
  });

  let company;

  if (businessDetails.userid) {
    company = await prisma.businessUsers.findFirst({
      where: {
        id: businessDetails.userid,
      },
    });
  }

  if (req.body.status) {
    const message = ``;

    let x = fs.readFileSync(__dirname + "/reviewLive.html", "utf8");

    let y = x
      .replace("{{name}}", review.name)
      .replace(
        "{{company}}",
        company ? company?.companyname : businessDetails.website
      );

    try {
      await sendEmail({
        email: user.email,
        subject: `${review.name}, your review is live now`,
        message,
        html: y,
      });

      res.status(200).json({
        message: "status updated",
      });
    } catch (err) {
      console.log(error);
      return next(
        new AppError("There was an error sending the email. Try again later!"),
        500
      );
    }
  } else {
    const message = ``;

    let x = fs.readFileSync(__dirname + "/reviewRemove.html", "utf8");

    let y = x
      .replaceAll("{{name}}", review.name)
      .replaceAll("{{company}}", company.companyname);

    try {
      await sendEmail({
        email: user.email,
        subject: `${review.name}, your review has been removed`,
        message,
        html: y,
      });

      res.status(200).json({
        message: "status updated",
      });
    } catch (err) {
      console.log(error);
      return next(
        new AppError("There was an error sending the email. Try again later!"),
        500
      );
    }
  }
});

exports.updateListingStatus = catchAsync(async (req, res, next) => {
  await prisma.companyListing.update({
    where: { id: req.body.id },
    data: { hasadmin: req.body.hasadmin },
  });

  res.status(200).json({
    message: "status updated",
  });
});

exports.getBlogCommentData = catchAsync(async (req, res, next) => {
  const limit = 10;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;

  const length = await prisma.blogComment.count({
    where: {
      postid: req.params.id,
    },
  });

  const data = await prisma.blogComment.findMany({
    where: {
      postid: req.params.id,
    },
    take: limit,
    skip: skip,
    orderBy: {
      date: "desc",
    },
  });

  res.status(200).json({
    message: "success",
    length,
    data,
  });
});

exports.adminClaim = catchAsync(async (req, res, next) => {
  await prisma.companyListing.update({
    where: {
      id: req.body.id,
    },
    data: {
      status: req.body.status,
    },
  });

  res.status(200).json({
    message: "status updated",
  });
});

exports.updateCateory = catchAsync(async (req, res, next) => {
  await prisma.category.update({
    where: {
      id: req.body.id,
    },
    data: {
      title: req.body.title,
    },
  });

  res.status(200).json({
    message: "category updated",
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  await prisma.category.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(204).json({
    message: "category deleted",
  });
});

exports.bulkUploaderController = catchAsync(async (req, res, next) => {
  const data = await prisma.companyListing.createMany({
    data: req.body,
  });

  res.status(201).json({
    message: "success",
    data,
  });
});

exports.updateTopCategoryStatus = catchAsync(async (req, res, next) => {
  await prisma.category.updateMany({
    where: { id: req.body.id },
    data: {
      onTop: req.body.status,
    },
  });

  res.status(200).json({
    message: "success",
  });
});

exports.updateTopUserStatus = catchAsync(async (req, res, next) => {
  await prisma.user.updateMany({
    where: { id: req.body.id },
    data: {
      isTop: req.body.status,
    },
  });

  res.status(200).json({
    message: "success",
  });
});
