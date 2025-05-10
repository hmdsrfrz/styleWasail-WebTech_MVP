import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import AppError from '../utils/appError.js';

let storage;
let upload;

// Initialize Cloudinary configuration
export const initializeCloudinary = () => {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Configure storage
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'style-wasail/outfits',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
      }
    });

    // Configure multer
    upload = multer({
      storage: storage,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new AppError('Not an image! Please upload only images.', 400), false);
        }
      }
    });

    console.log('Cloudinary configured successfully');
  } catch (error) {
    console.error('Cloudinary configuration error:', error.message);
    throw error;
  }
};

// Handle single image upload
export const uploadImage = (req, res, next) => {
  if (!upload) {
    return next(new AppError('Upload middleware not initialized', 500));
  }
  return upload.single('image')(req, res, next);
};

// Handle multiple image uploads
export const uploadImages = (req, res, next) => {
  if (!upload) {
    return next(new AppError('Upload middleware not initialized', 500));
  }
  return upload.array('image', 5)(req, res, next);
};

// Process uploaded images
export const handleImageUpload = async (req, res, next) => {
  try {
    if (!req.file && !req.files) {
      return next(new AppError('Please upload at least one image', 400));
    }

    // Handle single image upload
    if (req.file) {
      req.body.imageUrl = req.file.path;
      return next();
    }

    // Handle multiple image uploads
    if (req.files) {
      req.body.imageUrls = req.files.map(file => file.path);
      return next();
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return next(new AppError('Error uploading image(s): ' + error.message, 500));
  }
};

// Process outfit images (main + components)
export const handleOutfitImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('Please upload at least one image', 400));
    }

    console.log('Processing outfit images:', req.files);

    // First image is always the main outfit image
    req.body.mainImage = req.files[0].path;

    // Remaining images are component images
    if (req.files.length > 1) {
      const componentImages = req.files.slice(1).map(file => file.path);
      
      // If components array exists in request body, add images to it
      if (req.body.components && Array.isArray(req.body.components)) {
        req.body.components = req.body.components.map((component, index) => ({
          ...component,
          image: componentImages[index] || null
        }));
      }
    }

    console.log('Processed outfit data:', {
      mainImage: req.body.mainImage,
      components: req.body.components
    });

    next();
  } catch (error) {
    console.error('Outfit image processing error:', error);
    return next(new AppError('Error processing outfit images: ' + error.message, 500));
  }
}; 