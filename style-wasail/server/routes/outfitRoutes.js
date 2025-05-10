import express from 'express';
import {
  getAllOutfits,
  getOutfit,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  likeOutfit,
  addComment,
  getUserOutfits,
  getSpecificUserOutfits,
  checkOutfitRentability
} from '../controllers/outfitController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadImages, handleOutfitImages, handleImageUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllOutfits);
router.get('/:id', getOutfit);
router.get('/user/:userId', getSpecificUserOutfits);

// Protected routes
router.use(protect);

// Image upload route
router.post('/upload', uploadImages, handleImageUpload, (req, res) => {
  try {
    // Get the image URL(s) from the request body
    const imageUrls = req.body.imageUrls || [req.body.imageUrl];
    
    if (!imageUrls.length) {
      return res.status(400).json({
        status: 'error',
        message: 'No image URLs found in the response'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        imageUrls: imageUrls
      }
    });
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process image upload'
    });
  }
});

// Outfit routes
router.post('/', createOutfit);
router.put('/:id', uploadImages, handleOutfitImages, updateOutfit);
router.delete('/:id', deleteOutfit);
router.put('/:id/like', likeOutfit);
router.post('/:id/comments', addComment);
router.get('/user/me', getUserOutfits);
router.get('/:id/can-rent', checkOutfitRentability);

export default router; 