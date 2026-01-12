/**
 * Session Controller
 * Clean, professional session endpoints
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import {
  findSessionById,
  findUserSessions,
  createSession,
  archiveSession,
  unarchiveSession,
  muteSession,
  unmuteSession,
  markSessionAsUnread,
  deleteSession,
} from '../services/session.service';
import { sendSuccess, sendError } from '../utils/responses';

const createSessionSchema = z.object({
  participant2Id: z.string().min(1, 'Participant ID is required'),
  type: z.enum(['DIRECT', 'GROUP', 'AI']).optional(),
});

const updateSessionSchema = z.object({
  isArchived: z.boolean().optional(),
  isMuted: z.boolean().optional(),
});

export const getSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const includeArchived = req.query.archived === 'true';
    const sessions = await findUserSessions(req.user.id, includeArchived);

    sendSuccess(res, sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    sendError(res, 'Failed to fetch sessions', 'FETCH_ERROR', 500);
  }
};

export const getSession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = req.params;
    const session = await findSessionById(id);

    if (!session) {
      sendError(res, 'Session not found', 'NOT_FOUND', 404);
      return;
    }

    // Verify user is participant
    if (
      session.participant1Id !== req.user.id &&
      session.participant2Id !== req.user.id
    ) {
      sendError(res, 'Unauthorized', 'UNAUTHORIZED', 403);
      return;
    }

    sendSuccess(res, session);
  } catch (error) {
    console.error('Get session error:', error);
    sendError(res, 'Failed to fetch session', 'FETCH_ERROR', 500);
  }
};

export const startSession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    // Validate input
    const validation = createSessionSchema.safeParse(req.body);
    if (!validation.success) {
      sendError(res, 'Invalid input data', 'VALIDATION_ERROR', 400);
      return;
    }

    const { participant2Id, type } = validation.data;

    // Prevent self-chat
    if (participant2Id === req.user.id) {
      sendError(res, 'Cannot start session with yourself', 'INVALID_INPUT', 400);
      return;
    }

    const session = await createSession({
      participant1Id: req.user.id,
      participant2Id,
      type: type as any,
    });

    sendSuccess(res, session, 'Session created', 201);
  } catch (error) {
    console.error('Create session error:', error);
    sendError(res, 'Failed to create session', 'CREATE_ERROR', 500);
  }
};

export const archiveSessionHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = req.params;
    const session = await archiveSession(id, req.user.id);

    sendSuccess(res, session, 'Session archived');
  } catch (error: any) {
    if (error.message === 'Session not found') {
      sendError(res, error.message, 'NOT_FOUND', 404);
      return;
    }
    if (error.message === 'Unauthorized') {
      sendError(res, error.message, 'UNAUTHORIZED', 403);
      return;
    }
    console.error('Archive session error:', error);
    sendError(res, 'Failed to archive session', 'UPDATE_ERROR', 500);
  }
};

export const unarchiveSessionHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = req.params;
    const session = await unarchiveSession(id, req.user.id);

    sendSuccess(res, session, 'Session unarchived');
  } catch (error: any) {
    if (error.message === 'Session not found') {
      sendError(res, error.message, 'NOT_FOUND', 404);
      return;
    }
    if (error.message === 'Unauthorized') {
      sendError(res, error.message, 'UNAUTHORIZED', 403);
      return;
    }
    console.error('Unarchive session error:', error);
    sendError(res, 'Failed to unarchive session', 'UPDATE_ERROR', 500);
  }
};

export const muteSessionHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = req.params;
    const session = await muteSession(id, req.user.id);

    sendSuccess(res, session, 'Session muted');
  } catch (error: any) {
    if (error.message === 'Session not found') {
      sendError(res, error.message, 'NOT_FOUND', 404);
      return;
    }
    if (error.message === 'Unauthorized') {
      sendError(res, error.message, 'UNAUTHORIZED', 403);
      return;
    }
    console.error('Mute session error:', error);
    sendError(res, 'Failed to mute session', 'UPDATE_ERROR', 500);
  }
};

export const unmuteSessionHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = req.params;
    const session = await unmuteSession(id, req.user.id);

    sendSuccess(res, session, 'Session unmuted');
  } catch (error: any) {
    if (error.message === 'Session not found') {
      sendError(res, error.message, 'NOT_FOUND', 404);
      return;
    }
    if (error.message === 'Unauthorized') {
      sendError(res, error.message, 'UNAUTHORIZED', 403);
      return;
    }
    console.error('Unmute session error:', error);
    sendError(res, 'Failed to unmute session', 'UPDATE_ERROR', 500);
  }
};

export const markUnreadHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = req.params;
    const session = await markSessionAsUnread(id, req.user.id);

    sendSuccess(res, session, 'Session marked as unread');
  } catch (error: any) {
    if (error.message === 'Session not found') {
      sendError(res, error.message, 'NOT_FOUND', 404);
      return;
    }
    if (error.message === 'Unauthorized') {
      sendError(res, error.message, 'UNAUTHORIZED', 403);
      return;
    }
    console.error('Mark unread error:', error);
    sendError(res, 'Failed to mark session as unread', 'UPDATE_ERROR', 500);
  }
};

export const deleteSessionHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = req.params;
    await deleteSession(id, req.user.id);

    sendSuccess(res, null, 'Session deleted');
  } catch (error: any) {
    if (error.message === 'Session not found') {
      sendError(res, error.message, 'NOT_FOUND', 404);
      return;
    }
    if (error.message === 'Unauthorized') {
      sendError(res, error.message, 'UNAUTHORIZED', 403);
      return;
    }
    console.error('Delete session error:', error);
    sendError(res, 'Failed to delete session', 'DELETE_ERROR', 500);
  }
};
