const mongoose = require("mongoose");

const appOptionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const AppOption = mongoose.model("AppOption", appOptionSchema);

module.exports = AppOption;
