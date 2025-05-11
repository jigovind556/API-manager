const mongoose = require("mongoose");

// Endpoint schema (used for all types, with optional fields)
const endpointSchema = new mongoose.Schema({
  source: {
    type: String,
    trim: true,
  },
  destination: {
    type: String,
    trim: true,
  },
  portNo: {
    type: Number,
  },
  appUrl: {
    type: String,
    trim: true,
  },
  dnsName: {
    type: String,
    trim: true,
  },
  // API-specific fields
  apiName: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  httpType: {
    type: String,
    enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    trim: true,
  },
  header: {
    type: Boolean,
  },
  apiUrl: {
    type: String,
    trim: true,
  },
});

// Main API schema
const apiSchema = new mongoose.Schema(
  {
    environment: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["API", "UI", "Integration"],
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppOption",
      required: true,
    },
    endpoints: {
      type: [endpointSchema],
      required: true,
    },
    apiDescription: {
      type: String,
      trim: true,
    },
    applicationDescription: {
      type: String,
      trim: true,
    },
    request: {
      type: Object,
      required: true,
    },
    response: {
      type: Object,
      required: true,
    },
    attachment: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Custom validation based on API type
apiSchema.pre("validate", function (next) {
  const endpointFields = this.endpoints || [];
  let requiredFields = [];

  if (this.type === "API") {
    requiredFields = [
      "httpType",
      "header",
      "source",
      "destination",
      "portNo",
      "apiUrl",
      "dnsName",
    ];
  } else if (this.type === "UI") {
    requiredFields = ["appUrl",];
  } else if (this.type === "Integration") {
    requiredFields = [
      "source",
      "destination",
      "portNo",
      "appUrl",
      "dnsName",
    ];
  }

  const missing = [];

  endpointFields.forEach((ep, idx) => {
    requiredFields.forEach((field) => {
      if (ep[field] === undefined || ep[field] === null || ep[field] === "") {
        missing.push(`endpoints[${idx}].${field}`);
      }
    });

    // Additional conditional fields when header === true for API
    if (this.type === "API" && ep.header === true) {
      if (!ep.apiName || ep.apiName.trim() === "") {
        missing.push(`endpoints[${idx}].apiName`);
      }
      if (!ep.description || ep.description.trim() === "") {
        missing.push(`endpoints[${idx}].description`);
      }
    }
  });

  if (missing.length > 0) {
    return next(
      new Error(
        `Missing required fields for type '${this.type}': ${missing.join(", ")}`
      )
    );
  }

  next();
});

// Log schema
const apiLogSchema = new mongoose.Schema(
  {
    apiId: { type: mongoose.Schema.Types.ObjectId, ref: "API", required: true },
    changes: { type: Object, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const API = mongoose.model("API", apiSchema);
const API_Log = mongoose.model("API_Log", apiLogSchema);

module.exports = { API, API_Log };
