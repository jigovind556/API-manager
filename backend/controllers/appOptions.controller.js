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

const createAppOption = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Project name is required"));
  }

  const existingOption = await AppOption.findOne({ name });
  if (existingOption) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Project with this name already exists"));
  }

  const appOption = await AppOption.create({ name });
  res
    .status(201)
    .json(new ApiResponse(201, appOption, "Project created successfully"));
});

module.exports = { getAppOptions, createAppOption };
