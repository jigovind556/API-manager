
const AppOption = require("../models/appOptions.models");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");

const getAppOptions = asyncHandler(async (req, res) => {
  const appOptions = await AppOption.find().select("name");
  res
    .status(200)
    .json(
      new ApiResponse(200, appOptions, "Applications fetched successfully")
    );
});

module.exports = { getAppOptions };
