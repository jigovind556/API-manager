const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    projectname: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppOption",
      required: true,
    },
    appName: {
      type: String,
      required: true,
    },
    applicationDescription: {
      type: String,
    },
    enabled: {
      type: Boolean,
      default: true,
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
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);
module.exports = {Application};
