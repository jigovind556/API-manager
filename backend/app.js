const express = require("express");
const cookieParser = require('cookie-parser')
const cors = require("cors");

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

// routes declaration
app.use("/api/users", userRouter);


// 404 Error Handler


module.exports = { app };