const multer = require("multer");
const path = require("path");
const { ApiError } = require("../utils/ApiError");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in 'uploads/' directory
  },
  filename: (req, file, cb) => {
    var fname = Date.now() + path.extname(file.originalname);
    console.log('fname : ',fname);
    cb(null, fname); 
  },
});

// File filter: Allow only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new ApiError(501,"Only PDF files are allowed!"), false);
  }
};

// Multer upload middleware
const upload = multer({ storage, fileFilter });

module.exports = upload;
