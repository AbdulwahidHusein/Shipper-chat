/**
 * Shared Content Routes
 * Clean, professional shared media/links/documents API endpoints
 */

import { Router } from 'express';
import {
  getSharedMedia,
  createSharedMediaHandler,
  getSharedLinks,
  createSharedLinkHandler,
  getSharedDocuments,
  createSharedDocumentHandler,
} from '../controllers/shared-content.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// SHARED MEDIA
// ============================================

// Get shared media for a session
router.get('/media/session/:sessionId', getSharedMedia);

// Share media
router.post('/media', createSharedMediaHandler);

// ============================================
// SHARED LINKS
// ============================================

// Get shared links for a session
router.get('/links/session/:sessionId', getSharedLinks);

// Share link
router.post('/links', createSharedLinkHandler);

// ============================================
// SHARED DOCUMENTS
// ============================================

// Get shared documents for a session
router.get('/documents/session/:sessionId', getSharedDocuments);

// Share document
router.post('/documents', createSharedDocumentHandler);

export default router;
