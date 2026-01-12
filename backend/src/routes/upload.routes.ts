/**
 * Upload Routes
 * Clean, professional file upload endpoints
 */

import { Router } from 'express';
import { uploadFileHandler } from '../controllers/upload.controller';
import { uploadFile } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload file endpoint
router.post('/', uploadFile, uploadFileHandler);

export default router;
