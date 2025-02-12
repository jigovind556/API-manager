const { API } = require("../schema");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");

const createApi = asyncHandler(async (req, res) => {
  const {
    applicationName,
    source,
    destination,
    portNo,
    appUrl,
    apiDescription,
    applicationDescription,
    dnsName,
    request,
    response,
    // attachment,
  } = req.body;
  const attachment = req.file ? req.file.path : null;
  const createdBy = req.user._id;

  if (
    !applicationName ||
    !source ||
    !destination ||
    !portNo ||
    !appUrl ||
    !dnsName ||
    !request ||
    !response ||
    !createdBy
  ) {
    // check which field is missing
    for (const field of [
      "applicationName",
      "source",
      "destination",
      "portNo",
      "appUrl",
      "dnsName",
      "request",
      "response",
    ]) {
      if (!req.body[field]) {
        throw new ApiError(400, `${field} is required`);
      }
    }
    throw new ApiError(400, "All required fields must be provided");
  }

  const existingApi = await API.findOne({ appUrl });
  if (existingApi) {
    throw new ApiError(409, "API with this URL already exists");
  }

  const api = await API.create({
    applicationName,
    source,
    destination,
    portNo,
    appUrl,
    apiDescription,
    applicationDescription,
    dnsName,
    request,
    response,
    attachment,
    createdBy,
  });

  res.status(201).json(new ApiResponse(201, api, "API created successfully"));
});

const getAllApis = asyncHandler(async (req, res) => {
  const apis = await API.find()
    .populate("createdBy", "_id name username")
    .populate("updatedBy", "_id name username"); 

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
  const { id } = req.params;
  const updates = req.body;
  const updatedBy = req.user._id;

  // Find the existing API
  const existingApi = await API.findById(id);
  if (!existingApi) {
    throw new ApiError(404, "API not found");
  }

  // Update attachment only if a new file is uploaded
  if (req.file) {
    updates.attachment = req.file.path;
  } else {
    updates.attachment = existingApi.attachment;
  }

  // Update the API with new data
  const updatedApi = await API.findByIdAndUpdate(
    id,
    { ...updates, updatedBy },
    {
      new: true,
      runValidators: true,
    }
  );

  res
    .status(200)
    .json(new ApiResponse(200, updatedApi, "API updated successfully"));
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
