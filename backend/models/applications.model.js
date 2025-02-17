const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicationName: {
      type: String,
      required: true,
    },
    appName: {
      type: String,
      required: true,
    },
    applicationDescription: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;
