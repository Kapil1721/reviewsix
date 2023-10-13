const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const dotenv = require("dotenv");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const bodyParser = require("body-parser");

dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");

const globalErrorHandler = require("./controllers/errorController");

// -------------------------------------------------

const userRouter = require("./routes/userRoutes");
const contentRouter = require("./routes/contentRoutes");
const companyRouter = require("./routes/companyListing");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewsRoutes");

// -------------------------------------------------

const AppError = require("./utils/appError");

// *-------------------------------------

const port = process.env.PORT || 3000;

const app = express();

app.use(express.static(`${__dirname}`));

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

mongoose
  .connect(
    "mongodb+srv://sahilEgss05:cEN2JXfKnB8OIZnk@cluster0.fku9vqp.mongodb.net/review-website"
  )
  .then(() => console.log("DB connection successful!"));

// * ---------------------------

dotenv.config({ path: "./config.env" });

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.json());
app.use(helmet());
app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// app.get("/", async (req, res, next) => {
//   let x = fs.readFileSync(__dirname + "/emailTemp.html", "utf8");

//   let y = x.replace("{{name}}", "kamles").replace("%{{email}}%", "kabbo");

//   res.send(y);
// });
// * ---------------------------

app.use("/api/v1", userRouter);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/content", contentRouter);
app.use("/api/v1/review", reviewRoutes);

// * ---------------------------

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
