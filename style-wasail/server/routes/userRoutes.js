import express from 'express';
import {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  followUser,
  unfollowUser
} from '../controllers/userController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/follow/:id', protect, followUser);
router.put('/unfollow/:id', protect, unfollowUser);

export default router; 