const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");

const globalErrorHandler = require("./controllers/errorController");

// -------------------------------------------------

const userRouter = require("./routes/userRoutes");
const contentRouter = require("./routes/contentRoutes");
const companyRouter = require("./routes/companyListing");
const adminRoutes = require("./routes/adminRoutes");

// -------------------------------------------------

const AppError = require("./utils/appError");

// *-------------------------------------

const port = process.env.PORT || 3000;

const app = express();

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
app.use(express.json());
app.use(helmet());
app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
// * ---------------------------

app.use("/api/v1", userRouter);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/content", contentRouter);

// * ---------------------------
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );

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
