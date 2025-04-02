const express = require("express");
const cookieParser = require('cookie-parser')
const cors = require("cors");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.use(cookieParser());

// import routes
const userRouter = require('./routes/user.routes.js');
const apiRouter = require('./routes/api.routes.js');
const appOptionsRouter = require("./routes/appoptions.routes.js");
const applicationRouter = require("./routes/application.routes");


// routes declaration
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/users", userRouter);
app.use("/api/apis", apiRouter);
app.use("/api/applicationOptions", appOptionsRouter);
app.use("/api/applications", applicationRouter);


// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});


module.exports = { app };