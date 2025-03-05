//api.controller.js
const { API } = require("../schema");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");

const createApi = asyncHandler(async (req, res) => {
  const {
    applicationName,
    apiDescription,
    applicationDescription,
    request,
    response,
  } = req.body;
  const attachment = req.file ? req.file.path : null;
  const createdBy = req.user._id;

  const endpoints = req.body.endpoints;
  // let index = 0;
  // while (req.body[`endpoints[${index}][environment]`]) {
  //   endpoints.push({
  //     environment: req.body[`endpoints[${index}][environment]`],
  //     source: req.body[`endpoints[${index}][source]`],
  //     destination: req.body[`endpoints[${index}][destination]`],
  //     portNo: req.body[`endpoints[${index}][portNo]`],
  //     appUrl: req.body[`endpoints[${index}][appUrl]`],
  //     dnsName: req.body[`endpoints[${index}][dnsName]`],
  //   });
  //   index++;
  // }

  if (endpoints.length === 0) {
    throw new ApiError(400, "At least one endpoint must be provided");
  }

  // Check for missing fields
  if (!applicationName || !request || !response) {
    throw new ApiError(400, "All required fields must be provided");
  }

    const requiredFields = [
      "environment",
      "source",
      "destination",
      "portNo",
      "appUrl",
      "dnsName",
    ];
    for (const endpoint of endpoints) {
      for (const field of requiredFields) {
        if (!endpoint[field]) {
          throw new ApiError(
            400,
            `Missing field '${field}' in one of the endpoints`
          );
        }
      }
    }

  const existingApi = await API.findOne({ applicationName });
  if (existingApi) {
    throw new ApiError(409, "API with this URL already exists");
  }

  const api = await API.create({
    applicationName,
    endpoints, 
    apiDescription,
    applicationDescription,
    request: JSON.parse(request),
    response: JSON.parse(response),
    attachment,
    createdBy,
  });

  res.status(201).json(new ApiResponse(201, api, "API created successfully"));
});


const getAllApis = asyncHandler(async (req, res) => {
  const apis = await API.find()
    .populate("createdBy", "_id name username")
    .populate("updatedBy", "_id name username")
    .sort({ createdAt: -1 }); 

  res
    .status(200)
    .json(new ApiResponse(200, apis, "APIs retrieved successfully"));
});


const getApiById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const api = await API.findById(id).populate("createdBy", "_id name username");
  if (!api) {
    throw new ApiError(404, "API not found");
  }
  res.status(200).json(new ApiResponse(200, api, "API retrieved successfully"));
});

const updateApi = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    const updatedBy = req.user._id;

    // Find the existing API
    const existingApi = await API.findById(id);
    if (!existingApi) {
      throw new ApiError(404, "API not found");
    }

    // Parse request and response fields if they are strings
    if (updates.request) {
      try {
        updates.request = JSON.parse(updates.request);
      } catch (err) {
        throw new ApiError(400, "Invalid JSON format for request field");
      }
    }

    if (updates.response) {
      try {
        updates.response = JSON.parse(updates.response);
      } catch (err) {
        throw new ApiError(400, "Invalid JSON format for response field");
      }
    }

    // Handle file attachment update
    if (req.file) {
      // Delete old attachment if exists
      if (existingApi.attachment) {
        const oldFilePath = path.join(__dirname, "..", existingApi.attachment);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error("Error deleting old file:", err);
        });
      }
      updates.attachment = req.file.path;
    } else {
      updates.attachment = existingApi.attachment;
    }

    // Update the API record
    const updatedApi = await API.findByIdAndUpdate(
      id,
      { ...updates, updatedBy },
      { new: true, runValidators: true }
    );

    if (!updatedApi) {
      throw new ApiError(500, "Failed to update API");
    }

    res
      .status(200)
      .json(new ApiResponse(200, updatedApi, "API updated successfully"));
  } catch (error) {
    console.error("Update API Error:", error);
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Server error"
    );
  }
});

const deleteApi = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const api = await API.findByIdAndDelete(id);
  if (!api) {
    throw new ApiError(404, "API not found");
  }
  res.status(200).json(new ApiResponse(200, null, "API deleted successfully"));
});

module.exports = { createApi, getAllApis, getApiById, updateApi, deleteApi };
