import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';



// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars first
const envPath = path.join(__dirname, 'config/config.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Verify environment variables are loaded
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'ATLAS_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

console.log('Environment variables loaded successfully');

import connectDB from './config/db.js';
import errorHandler from './middleware/error.js';
import { initializeCloudinary } from './middleware/uploadMiddleware.js';

// Initialize Cloudinary
try {
  initializeCloudinary();
} catch (error) {
  console.error('Failed to initialize Cloudinary:', error.message);
  process.exit(1);
}

// Connect to database
connectDB();

// Route files
import userRoutes from './routes/userRoutes.js';
import outfitRoutes from './routes/outfitRoutes.js';
import moodboardRoutes from './routes/moodboardRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';

const app = express();

// Body parser
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});





// Mount routers
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/outfits', outfitRoutes);
app.use('/api/v1/moodboards', moodboardRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/rentals', rentalRoutes);

// Mount transaction routes on outfits
app.use('/api/v1/outfits/:outfitId/transactions', transactionRoutes);

// Mount review routes on transactions
app.use('/api/v1/transactions/:transactionId/reviews', reviewRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log('Environment variables loaded:', {
    NODE_ENV: process.env.NODE_ENV,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '***' : undefined,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '***' : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 