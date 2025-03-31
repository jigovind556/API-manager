const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// Configure Multer (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to upload files to Cloudinary
const uploadToCloudinary = (fileBuffer, originalname, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: folder || "other_uploads",
          public_id: originalname.split(".")[0],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      )
      .end(fileBuffer);
  });
};

// Middleware to handle file uploads
const cloudinaryUploadMiddleware = (folder) => async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      req.body.attachments = []; // No files uploaded
      return next();
    }

    // Upload all files to Cloudinary in the specified folder
    const uploadedUrls = await Promise.all(
      req.files.map((file) =>
        uploadToCloudinary(file.buffer, file.originalname, folder)
      )
    );

    // Attach URLs to req.body
    req.body.attachment = uploadedUrls;

    next(); // Proceed to next middleware/controller
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return res.status(500).json({ error: "File upload failed" });
  }
};

module.exports = { upload, cloudinaryUploadMiddleware };
