const multer = require("multer");
const path = require("path");
const { ApiError } = require("../utils/ApiError");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in 'uploads/' directory
  },
  filename: (req, file, cb) => {
    const fname = Date.now() + "-" + file.originalname;
    console.log("fname:", fname);
    cb(null, fname);
  },
});

// File filter: Allow all file types
const fileFilter = (req, file, cb) => {
  cb(null, true); // Accept all file types
};

// Multer upload middleware (Allow up to 5 files)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}); // Max file size 10MB

module.exports = upload;
