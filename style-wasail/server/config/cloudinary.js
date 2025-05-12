import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './server/config/config.env' });

// Debug: Log environment variables
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : undefined
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Add enhanced debugging for uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'style-wasail',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

// Create multer upload with debugging middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Add debug wrapper for upload
const debugUpload = (fieldName) => {
  console.log(`Setting up upload middleware for field: ${fieldName}`);
  const middleware = upload.single(fieldName);
  
  return (req, res, next) => {
    console.log('Processing file upload request...');
    middleware(req, res, (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({
          status: 'error',
          message: `File upload failed: ${err.message}`
        });
      }
      
      if (req.file) {
        console.log('File uploaded successfully:', {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          path: req.file.path,
          size: req.file.size
        });
      } else {
        console.log('No file was uploaded');
      }
      
      next();
    });
  };
};

export { cloudinary, upload, debugUpload }; 