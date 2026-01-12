/**
 * Shared Content Controller
 * Clean, professional shared media/links/documents endpoints
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import {
  findSharedMediaBySession,
  createSharedMedia,
  findSharedLinksBySession,
  createSharedLink,
  findSharedDocumentsBySession,
  createSharedDocument,
} from '../services/shared-content.service';
import { sendSuccess, sendError } from '../utils/responses';
import { findSessionById } from '../services/session.service';

// ============================================
// SHARED MEDIA
// ============================================

const createSharedMediaSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO']),
  url: z.string().url('Invalid URL'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL'),
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const getSharedMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { sessionId } = req.params;

    // Verify user is participant
    const session = await findSessionById(sessionId);
    if (!session) {
      sendError(res, 'Session not found', 'NOT_FOUND', 404);
      return;
    }

    if (
      session.participant1Id !== req.user.id &&
      session.participant2Id !== req.user.id
    ) {
      sendError(res, 'Unauthorized', 'UNAUTHORIZED', 403);
      return;
    }

    const media = await findSharedMediaBySession(sessionId);
    sendSuccess(res, media);
  } catch (error) {
    console.error('Get shared media error:', error);
    sendError(res, 'Failed to fetch shared media', 'FETCH_ERROR', 500);
  }
};

export const createSharedMediaHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    // Validate input
    const validation = createSharedMediaSchema.safeParse(req.body);
    if (!validation.success) {
      sendError(res, 'Invalid input data', 'VALIDATION_ERROR', 400);
      return;
    }

    const { type, url, thumbnailUrl, sessionId } = validation.data;

    // Verify user is participant
    const session = await findSessionById(sessionId);
    if (!session) {
      sendError(res, 'Session not found', 'NOT_FOUND', 404);
      return;
    }

    if (
      session.participant1Id !== req.user.id &&
      session.participant2Id !== req.user.id
    ) {
      sendError(res, 'Unauthorized', 'UNAUTHORIZED', 403);
      return;
    }

    const media = await createSharedMedia({
      type: type as any,
      url,
      thumbnailUrl,
      sessionId,
      uploadedById: req.user.id,
    });

    sendSuccess(res, media, 'Media shared', 201);
  } catch (error) {
    console.error('Create shared media error:', error);
    sendError(res, 'Failed to share media', 'CREATE_ERROR', 500);
  }
};

// ============================================
// SHARED LINKS
// ============================================

const createSharedLinkSchema = z.object({
  url: z.string().url('Invalid URL'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  favicon: z.string().url('Invalid favicon URL').optional(),
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const getSharedLinks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { sessionId } = req.params;

    // Verify user is participant
    const session = await findSessionById(sessionId);
    if (!session) {
      sendError(res, 'Session not found', 'NOT_FOUND', 404);
      return;
    }

    if (
      session.participant1Id !== req.user.id &&
      session.participant2Id !== req.user.id
    ) {
      sendError(res, 'Unauthorized', 'UNAUTHORIZED', 403);
      return;
    }

    const links = await findSharedLinksBySession(sessionId);
    sendSuccess(res, links);
  } catch (error) {
    console.error('Get shared links error:', error);
    sendError(res, 'Failed to fetch shared links', 'FETCH_ERROR', 500);
  }
};

export const createSharedLinkHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    // Validate input
    const validation = createSharedLinkSchema.safeParse(req.body);
    if (!validation.success) {
      sendError(res, 'Invalid input data', 'VALIDATION_ERROR', 400);
      return;
    }

    const { url, title, description, favicon, sessionId } = validation.data;

    // Verify user is participant
    const session = await findSessionById(sessionId);
    if (!session) {
      sendError(res, 'Session not found', 'NOT_FOUND', 404);
      return;
    }

    if (
      session.participant1Id !== req.user.id &&
      session.participant2Id !== req.user.id
    ) {
      sendError(res, 'Unauthorized', 'UNAUTHORIZED', 403);
      return;
    }

    const link = await createSharedLink({
      url,
      title,
      description,
      favicon,
      sessionId,
      sharedById: req.user.id,
    });

    sendSuccess(res, link, 'Link shared', 201);
  } catch (error) {
    console.error('Create shared link error:', error);
    sendError(res, 'Failed to share link', 'CREATE_ERROR', 500);
  }
};

// ============================================
// SHARED DOCUMENTS
// ============================================

const createSharedDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.enum(['PDF', 'DOC', 'DOCX', 'FIG', 'AI', 'PSD', 'XD', 'SKETCH']),
  size: z.number().int().positive('Size must be positive'),
  pages: z.number().int().positive().optional(),
  url: z.string().url('Invalid URL').optional(),
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const getSharedDocuments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { sessionId } = req.params;

    // Verify user is participant
    const session = await findSessionById(sessionId);
    if (!session) {
      sendError(res, 'Session not found', 'NOT_FOUND', 404);
      return;
    }

    if (
      session.participant1Id !== req.user.id &&
      session.participant2Id !== req.user.id
    ) {
      sendError(res, 'Unauthorized', 'UNAUTHORIZED', 403);
      return;
    }

    const documents = await findSharedDocumentsBySession(sessionId);
    sendSuccess(res, documents);
  } catch (error) {
    console.error('Get shared documents error:', error);
    sendError(res, 'Failed to fetch shared documents', 'FETCH_ERROR', 500);
  }
};

export const createSharedDocumentHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    // Validate input
    const validation = createSharedDocumentSchema.safeParse(req.body);
    if (!validation.success) {
      sendError(res, 'Invalid input data', 'VALIDATION_ERROR', 400);
      return;
    }

    const { name, type, size, pages, url, sessionId } = validation.data;

    // Verify user is participant
    const session = await findSessionById(sessionId);
    if (!session) {
      sendError(res, 'Session not found', 'NOT_FOUND', 404);
      return;
    }

    if (
      session.participant1Id !== req.user.id &&
      session.participant2Id !== req.user.id
    ) {
      sendError(res, 'Unauthorized', 'UNAUTHORIZED', 403);
      return;
    }

    const document = await createSharedDocument({
      name,
      type: type as any,
      size,
      pages,
      url,
      sessionId,
      uploadedById: req.user.id,
    });

    sendSuccess(res, document, 'Document shared', 201);
  } catch (error) {
    console.error('Create shared document error:', error);
    sendError(res, 'Failed to share document', 'CREATE_ERROR', 500);
  }
};
