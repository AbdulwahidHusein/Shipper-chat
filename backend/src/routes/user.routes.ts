import { Router } from 'express';
import { getUserProfile, updateOwnProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/:userId', authenticate, getUserProfile);
router.patch('/me', authenticate, updateOwnProfile);

export default router;
