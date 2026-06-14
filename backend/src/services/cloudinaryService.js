const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const uploadImage = async (file) => {
  const isMockCloudinary = 
    !process.env.CLOUDINARY_CLOUD_NAME || 
    process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloudinary' || 
    process.env.CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name';

  if (isMockCloudinary) {
    // Local fallback
    const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    const destPath = path.join(uploadsDir, filename);
    
    // Save file buffer
    fs.writeFileSync(destPath, file.buffer);
    
    // Return local URL path
    return `/uploads/${filename}`;
  }

  // Real Cloudinary upload from buffer
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'campus-resell-portal' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(file.buffer);
  });
};

module.exports = {
  uploadImage
};
