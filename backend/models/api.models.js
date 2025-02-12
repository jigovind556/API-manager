const mongoose = require("mongoose");

const apiSchema = new mongoose.Schema(
  {
    applicationName: {
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
    apiDescription: {
      type: String,
      trim: true,
    },
    applicationDescription: {
      type: String,
      trim: true,
    },
    dnsName: {
      type: String,
      required: true,
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

const API = mongoose.model("API", apiSchema);

module.exports = API;
