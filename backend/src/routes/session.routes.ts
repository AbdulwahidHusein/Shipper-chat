/**
 * Session Routes
 * Clean, professional session API endpoints
 */

import { Router } from 'express';
import {
  getSessions,
  getSession,
  startSession,
  archiveSessionHandler,
  unarchiveSessionHandler,
  muteSessionHandler,
  unmuteSessionHandler,
  markUnreadHandler,
  deleteSessionHandler,
} from '../controllers/session.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all sessions for current user
router.get('/', getSessions);

// Get specific session
router.get('/:id', getSession);

// Create/start new session
router.post('/', startSession);

// Archive session
router.patch('/:id/archive', archiveSessionHandler);

// Unarchive session
router.patch('/:id/unarchive', unarchiveSessionHandler);

// Mute session
router.patch('/:id/mute', muteSessionHandler);

// Unmute session
router.patch('/:id/unmute', unmuteSessionHandler);

// Mark session as unread
router.patch('/:id/mark-unread', markUnreadHandler);

// Delete session
router.delete('/:id', deleteSessionHandler);

export default router;
