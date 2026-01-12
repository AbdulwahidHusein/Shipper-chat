/**
 * Message Routes
 * Clean, professional message API endpoints
 */

import { Router } from 'express';
import {
  getMessages,
  sendMessage,
  editMessage,
  markRead,
  markAllRead,
  deleteMessageHandler,
  clearMessages,
} from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get messages for a session
router.get('/session/:sessionId', getMessages);

// Send new message
router.post('/', sendMessage);

// Edit message
router.patch('/:id', editMessage);

// Mark message as read
router.patch('/:id/read', markRead);

// Mark all messages in session as read
router.patch('/session/:sessionId/read-all', markAllRead);

// Delete message (soft delete)
router.delete('/:id', deleteMessageHandler);

// Clear all messages in session (soft delete)
router.delete('/session/:sessionId/clear', clearMessages);

export default router;
