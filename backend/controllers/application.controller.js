const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const Application = require("../models/applications.model");

// Create Application
const createApplication = asyncHandler(async (req, res) => {
  const { applicationName, appName, applicationDescription } = req.body;
  const createdBy = req.user._id;

  if (!applicationName || !appName) {
    console.log("applicationName", applicationName);
    console.log("appName", appName);
    throw new ApiError(400, "Application Name and App Name are required");
  }

  const newApplication = await Application.create({
    applicationName,
    appName,
    applicationDescription,
    createdBy,
    enabled: true,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, newApplication, "Application created successfully")
    );
});

const getAllApplications = asyncHandler(async (req, res) => {
  const applications = await Application.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "_id",
        as: "updatedBy",
      },
    },
    {
      $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$updatedBy", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "applications",
        let: {
          appNameValue: "$appName",
          applicationNameValue: "$applicationName",
        },
        pipeline: [
          { $match: { $expr: { $eq: ["$appName", "$$appNameValue"] } } },
          { $count: "count" },
        ],
        as: "count_apps",
      },
    },
    {
      $lookup: {
        from: "applications",
        let: { applicationNameValue: "$applicationName" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$applicationName", "$$applicationNameValue"] },
            },
          },
          { $count: "count" },
        ],
        as: "count_applications",
      },
    },
    {
      $addFields: {
        count_apps: { $ifNull: [{ $arrayElemAt: ["$count_apps.count", 0] }, 0] },
        count_applications: {
          $ifNull: [{ $arrayElemAt: ["$count_applications.count", 0] }, 0],
        },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

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

const updateApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updatedBy = req.user._id;

  const application = await Application.findByIdAndUpdate(
    id,
    { ...updates, updatedBy },
    { new: true }
  );

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, application, "Application updated successfully")
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
  updateApplication,
  deleteApplication,
};
