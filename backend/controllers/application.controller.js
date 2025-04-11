const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const { Application } = require("../models/applications.model");

// Create Application
const createApplication = asyncHandler(async (req, res) => {
  const { projectname, appName, applicationDescription } = req.body;
  const createdBy = req.user._id;

  if (!projectname || !appName) {
    console.log("projectname", projectname);
    console.log("appName", appName);
    throw new ApiError(400, "Application Name and App Name are required");
  }

  // Check if application with same name already exists
  const existingApplication = await Application.findOne({
    appName: { $regex: new RegExp(`^${appName}$`, "i") },
  });

  if (existingApplication) {
    throw new ApiError(400, "Application with this name already exists");
  }

  const newApplication = await Application.create({
    projectname,
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
      $lookup: {
        from: "appoptions",
        localField: "projectname",
        foreignField: "_id",
        as: "projectname",
      },
    },
    {
      $unwind: { path: "$projectname", preserveNullAndEmptyArrays: true },
    },
    // {
    //   $addFields: {
    //     projectName: "$projectname.name",
    //     appName: { $ifNull: ["$appName", ""] },
    //     applicationName: { $ifNull: ["$applicationName", ""] },
    //     applicationDescription: {
    //       $ifNull: ["$applicationDescription", "N/A"],
    //     },
    //   },
    // },
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
          projectnameValue: "$applicationName",
        },
        pipeline: [
          { $match: { $expr: { $eq: ["$appName", "$$appNameValue"] } } },
          { $count: "count" },
        ],
        as: "count_apps",
      },
    },
    // {
    //   $lookup: {
    //     from: "applications",
    //     let: { projectnameValue: "$projectname.name" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: { $eq: ["$projectname.name", "$$projectnameValue"] },
    //         },
    //       },
    //       { $count: "count" },
    //     ],
    //     as: "count_projects",
    //   },
    // },
    {
      $addFields: {
        // count_projects: {
        //   $ifNull: [{ $arrayElemAt: ["$count_projects.count", 0] }, 0],
        // },
        count_apps: {
          $ifNull: [{ $arrayElemAt: ["$count_apps.count", 0] }, 0],
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

const getApplicationList = asyncHandler(async (req, res) => {
  const applications = await Application.find()
    .select("projectname appName applicationDescription")
    .where({ enabled: true });
  if (!applications) {  
    throw new ApiError(404, "No applications found");
  }
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

  // If application name is being updated, check for uniqueness
  if (updates.appName) {
    const existingApplication = await Application.findOne({
      appName: { $regex: new RegExp(`^${updates.appName}$`, "i") },
      _id: { $ne: id }, // Exclude current application from check
    });

    if (existingApplication) {
      throw new ApiError(400, "Application with this name already exists");
    }
  }

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
  getApplicationList,
  getApplicationById,
  updateApplication,
  deleteApplication,
};
