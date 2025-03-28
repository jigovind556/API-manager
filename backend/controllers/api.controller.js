//api.controller.js
const { API,API_Log } = require("../schema");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");

const createApi = asyncHandler(async (req, res) => {
  const {
    application,
    project,
    apiDescription,
    applicationDescription,
    request,
    response,
  } = req.body;
  const attachment = req.file ? req.file.path : null;
  const createdBy = req.user._id;

  const endpoints = req.body.endpoints;

  if (endpoints.length === 0) {
    throw new ApiError(400, "At least one endpoint must be provided");
  }
  console.log('application', application);
  console.log('project', project);
  console.log('request', request);
  console.log('response', response);
  // Check for missing fields
  if (!application || !project || !request || !response) {
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

  // const existingApi = await API.findOne({ applicationName });
  // if (existingApi) {
  //   throw new ApiError(409, "API with this URL already exists");
  // }

  const api = await API.create({
    application,
    project,
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
    .populate("application", "_id appName")
    .populate("project", "_id name")
    .populate("createdBy", "_id name username")
    .populate("updatedBy", "_id name username")
    .sort({ createdAt: -1 }); 

  res
    .status(200)
    .json(new ApiResponse(200, apis, "APIs retrieved successfully"));
});


const getApiById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const api = await API.findById(id)
  .populate("application", "_id appName")
  .populate("project", "_id name")
  .populate("createdBy", "_id name username");
  if (!api) {
    throw new ApiError(404, "API not found");
  }
  res.status(200).json(new ApiResponse(200, api, "API retrieved successfully"));
});

const findChanges = (oldObj, newObj, parentKey = "") => {
  let changes = {};

  // Fields to ignore
  const ignoredFields = [
    "_id",
    "_v",
    "__v",
    "updatedAt",
    "createdBy",
    "createdAt",
    "updatedBy",
  ];

  if (!oldObj || typeof oldObj !== "object") return changes;
  if (!newObj || typeof newObj !== "object") return changes;

  for (let key in oldObj) {
    let fullPath = parentKey ? `${parentKey}.${key}` : key;

    if (ignoredFields.includes(key)) continue; // Skip ignored fields

    if (!Object.prototype.hasOwnProperty.call(newObj, key)) {
      // Field was removed
      changes[fullPath] = { old: oldObj[key], new: undefined };
    } else if (
      typeof oldObj[key] === "object" &&
      oldObj[key] !== null &&
      newObj[key] !== null
    ) {
      if (Array.isArray(oldObj[key]) && Array.isArray(newObj[key])) {
        let arrayChanges = compareArrays(oldObj[key], newObj[key], fullPath);
        if (Object.keys(arrayChanges).length > 0) {
          changes = { ...changes, ...arrayChanges };
        }
      } else {
        let nestedChanges = findChanges(oldObj[key], newObj[key], fullPath);
        if (Object.keys(nestedChanges).length > 0) {
          changes = { ...changes, ...nestedChanges };
        }
      }
    } else {
      // Normalize null and "null"
      const oldValue = oldObj[key] === "null" ? null : oldObj[key];
      const newValue = newObj[key] === "null" ? null : newObj[key];

      // Normalize number and string comparison
      if (typeof oldValue === "number" && typeof newValue === "string") {
        if (oldValue.toString() === newValue) continue;
      }
      if (typeof oldValue === "string" && typeof newValue === "number") {
        if (parseFloat(oldValue) === newValue) continue;
      }

      if (oldValue !== newValue) {
        changes[fullPath] = { old: oldValue, new: newValue };
      }
    }
  }

  for (let key in newObj) {
    let fullPath = parentKey ? `${parentKey}.${key}` : key;

    if (ignoredFields.includes(key)) continue; // Skip ignored fields

    if (!Object.prototype.hasOwnProperty.call(oldObj, key)) {
      changes[fullPath] = { old: undefined, new: newObj[key] };
    }
  }

  return changes;
};



// Helper function to compare arrays deeply
const compareArrays = (oldArr, newArr, parentKey) => {
  let changes = {};

  oldArr.forEach((item, index) => {
    if (index >= newArr.length) {
      // Old item removed
      changes[`${parentKey}.${index}`] = { old: item, new: undefined };
    } else {
      let diff = findChanges(item, newArr[index], `${parentKey}.${index}`);
      if (Object.keys(diff).length > 0) {
        changes = { ...changes, ...diff };
      }
    }
  });

  // Check for newly added items
  for (let i = oldArr.length; i < newArr.length; i++) {
    changes[`${parentKey}.${i}`] = { old: undefined, new: newArr[i] };
  }

  return changes;
};


const updateApi = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    const updatedBy = req.user._id;

    const existingApi = await API.findById(id);
    if (!existingApi) {
      throw new ApiError(404, "API not found");
    }

    // Ensure existingApi is a plain object
    const oldData = existingApi.toObject();

    // Parse request/response if needed
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

    // Track actual changes
    const changes = findChanges(oldData, updates);

    if (Object.keys(changes).length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, existingApi, "No changes detected"));
    }

    const updatedApi = await API.findByIdAndUpdate(
      id,
      { ...updates, updatedBy },
      { new: true, runValidators: true }
    );

    await API_Log.create({
      apiId: id,
      changes,
      updatedBy,
    });

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

const getApiHistory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Query condition: If `id` is provided, filter by `apiId`, otherwise fetch all
    const query = id ? { apiId: id } : {};

    // Fetch history records based on the query, sorted by latest updates
    const history = await API_Log.find(query)
      .populate("updatedBy", "_id name username")
      .populate("apiId", "_id applicationName apiDescription")
      .sort({ updatedAt: -1 })
      .lean();

    if (!history.length) {
      throw new ApiError(404, "No change history found for this API");
    }

    res
      .status(200)
      .json(new ApiResponse(200, history, "API history fetched successfully"));
  } catch (error) {
    console.error("Error fetching API history:", error);
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

module.exports = {
  createApi,
  getAllApis,
  getApiById,
  updateApi,
  deleteApi,
  getApiHistory,
};
