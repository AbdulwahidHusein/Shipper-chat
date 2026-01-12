import { Router } from 'express';
import {
  getUserProfile,
  updateOwnProfile,
  getAllUsers,
  getOnlineUsers,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users (for new message modal)
router.get('/', getAllUsers);

// Get online users
router.get('/online', getOnlineUsers);

// Get specific user profile
router.get('/:userId', getUserProfile);

// Update own profile
router.patch('/me', updateOwnProfile);

export default router;
