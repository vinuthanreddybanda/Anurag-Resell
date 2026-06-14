const multer = require('multer');
const AppError = require('../utils/appError');

// Store files in memory as buffer for Cloudinary uploading
const multerStorage = multer.memoryStorage();

// Filter for images only
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
