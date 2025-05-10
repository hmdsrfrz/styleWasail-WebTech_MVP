import express from 'express';
import {
  getMoodboards,
  getMoodboard,
  createMoodboard,
  updateMoodboard,
  deleteMoodboard,
  addOutfit,
  removeOutfit
} from '../controllers/moodboardController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getMoodboards)
  .post(protect, createMoodboard);

router
  .route('/:id')
  .get(getMoodboard)
  .put(protect, updateMoodboard)
  .delete(protect, deleteMoodboard);

router
  .route('/:id/outfits')
  .post(protect, addOutfit);

router
  .route('/:id/outfits/:outfitId')
  .delete(protect, removeOutfit);

export default router; 