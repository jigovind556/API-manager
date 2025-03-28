const mongoose = require("mongoose");

const endpointSchema = new mongoose.Schema({
  environment: {
    type: String,
    required: true,
    trim: true,
  },
  source: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  portNo: {
    type: Number,
    required: true,
  },
  appUrl: {
    type: String,
    required: true,
    trim: true,
  },
  dnsName: {
    type: String,
    required: true,
    trim: true,
  },
});

const apiSchema = new mongoose.Schema(
  {
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
      type: String,
      trim: true,
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

const apiLogSchema = new mongoose.Schema(
  {
    apiId: { type: mongoose.Schema.Types.ObjectId, ref: "API", required: true },
    changes: { type: Object, required: true }, // Only changed fields
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const API = mongoose.model("API", apiSchema);
const API_Log = mongoose.model("API_Log", apiLogSchema);

module.exports = { API, API_Log };
