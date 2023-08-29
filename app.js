const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const dotenv = require("dotenv");

const globalErrorHandler = require("./controllers/errorController");

// -------------------------------------------------

const userRouter = require("./routes/userRoutes");
const contentRouter = require("./routes/contentRoutes");
const companyRouter = require("./routes/companyListing");
const adminRoutes = require("./routes/adminRoutes");

// -------------------------------------------------

const AppError = require("./utils/appError");

// *-------------------------------------

const app = express();

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

module.exports = app;
