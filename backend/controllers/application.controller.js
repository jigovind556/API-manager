
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const Application = require("../models/applications.model");

// Create Application
const createApplication = asyncHandler(async (req, res) => {
  const { applicationName, appName, applicationDescription } = req.body;
  const createdBy = req.user._id;

  if (!applicationName || !appName) {
    console.log('applicationName', applicationName);
    console.log('appName', appName);
    throw new ApiError(400, "Application Name and App Name are required");
  }

  const newApplication = await Application.create({
    applicationName,
    appName,
    applicationDescription,
    createdBy,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, newApplication, "Application created successfully")
    );
});

// Get All Applications
const getAllApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find()
    .populate("createdBy", "_id name username")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, applications, "Applications retrieved successfully")
    );
});

// Get Application by ID
const getApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const application = await Application.findById(id).populate(
    "createdBy",
    "_id name username"
  );

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, application, "Application retrieved successfully")
    );
});

// Delete Application
const deleteApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const application = await Application.findByIdAndDelete(id);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Application deleted successfully"));
});

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  deleteApplication,
};
