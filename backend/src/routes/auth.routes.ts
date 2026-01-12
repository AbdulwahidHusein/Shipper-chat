import { Router } from 'express';
import {
  googleAuth,
  googleCallback,
  getCurrentUser,
  logout,
  refreshToken,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);
router.post('/refresh', authenticate, refreshToken);

export default router;
