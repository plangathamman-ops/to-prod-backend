const cloudinary = require('cloudinary').v2;
const config = require('../config/config');

// Configure Cloudinary - skip if credentials are missing
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
  });
}

// Upload file to Cloudinary
exports.uploadToCloudinary = async (file, folder) => {
  try {
    // Skip if Cloudinary is not configured
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      console.warn('Cloudinary not configured - skipping file upload');
      return {
        url: 'https://placeholder.com/file',
        publicId: 'placeholder_id'
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id
            });
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  } catch (error) {
    throw new Error('Error uploading file: ' + error.message);
  }
};

// Delete file from Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      return;
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
  }
};

