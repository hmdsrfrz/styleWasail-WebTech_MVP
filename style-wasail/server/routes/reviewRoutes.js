import express from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, createReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

export default router; 