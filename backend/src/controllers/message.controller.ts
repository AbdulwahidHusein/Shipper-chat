/**
 * Message Controller
 * Clean, professional message endpoints
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import {
  findMessageById,
  findMessagesBySession,
  createMessage,
  updateMessage,
  markMessageAsRead,
  markMessagesAsRead,
  deleteMessage,
  clearSessionMessages,
} from '../services/message.service';
import { sendSuccess, sendError } from '../utils/responses';

const createMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(5000),
  sessionId: z.string().min(1, 'Session ID is required'),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'FILE', 'LINK']).optional(),
});

const updateMessageSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
});

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const cursor = req.query.cursor as string | undefined;

    // Verify user is participant in session
    const { findSessionById } = await import('../services/session.service');
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

    const messages = await findMessagesBySession(sessionId, limit, cursor);

    sendSuccess(res, {
      messages: messages.reverse(), // Reverse to show oldest first
      nextCursor: messages.length === limit ? messages[0]?.id : null,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    sendError(res, 'Failed to fetch messages', 'FETCH_ERROR', 500);
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    // Validate input
    const validation = createMessageSchema.safeParse(req.body);
    if (!validation.success) {
      sendError(res, 'Invalid input data', 'VALIDATION_ERROR', 400);
      return;
    }

    const { content, sessionId, type } = validation.data;

    // Verify user is participant in session
    const { findSessionById } = await import('../services/session.service');
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

    const message = await createMessage({
      content,
      senderId: req.user.id,
      sessionId,
      type: type as any,
    });

    sendSuccess(res, message, 'Message sent', 201);
  } catch (error) {
    console.error('Send message error:', error);
    sendError(res, 'Failed to send message', 'CREATE_ERROR', 500);
  }
};

export const editMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = req.params;

    // Validate input
    const validation = updateMessageSchema.safeParse(req.body);
    if (!validation.success) {
      sendError(res, 'Invalid input data', 'VALIDATION_ERROR', 400);
      return;
    }

    const message = await updateMessage(id, validation.data, req.user.id);

    sendSuccess(res, message, 'Message updated');
  } catch (error: any) {
    if (error.message === 'Message not found') {
      sendError(res, error.message, 'NOT_FOUND', 404);
      return;
    }
    if (error.message === 'Unauthorized') {
      sendError(res, error.message, 'UNAUTHORIZED', 403);
      return;
    }
    console.error('Edit message error:', error);
    sendError(res, 'Failed to update message', 'UPDATE_ERROR', 500);
  }
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = req.params;
    const message = await markMessageAsRead(id, req.user.id);

    sendSuccess(res, message, 'Message marked as read');
  } catch (error: any) {
    if (error.message === 'Message not found') {
      sendError(res, error.message, 'NOT_FOUND', 404);
      return;
    }
    if (error.message === 'Unauthorized') {
      sendError(res, error.message, 'UNAUTHORIZED', 403);
      return;
    }
    console.error('Mark read error:', error);
    sendError(res, 'Failed to mark message as read', 'UPDATE_ERROR', 500);
  }
};

export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { sessionId } = req.params;
    await markMessagesAsRead(sessionId, req.user.id);

    sendSuccess(res, null, 'All messages marked as read');
  } catch (error: any) {
    if (error.message === 'Session not found') {
      sendError(res, error.message, 'NOT_FOUND', 404);
      return;
    }
    if (error.message === 'Unauthorized') {
      sendError(res, error.message, 'UNAUTHORIZED', 403);
      return;
    }
    console.error('Mark all read error:', error);
    sendError(res, 'Failed to mark messages as read', 'UPDATE_ERROR', 500);
  }
};

export const deleteMessageHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = req.params;
    const message = await deleteMessage(id, req.user.id);

    sendSuccess(res, message, 'Message deleted');
  } catch (error: any) {
    if (error.message === 'Message not found') {
      sendError(res, error.message, 'NOT_FOUND', 404);
      return;
    }
    if (error.message === 'Unauthorized') {
      sendError(res, error.message, 'UNAUTHORIZED', 403);
      return;
    }
    console.error('Delete message error:', error);
    sendError(res, 'Failed to delete message', 'DELETE_ERROR', 500);
  }
};

export const clearMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const { sessionId } = req.params;
    await clearSessionMessages(sessionId, req.user.id);

    sendSuccess(res, null, 'All messages cleared');
  } catch (error: any) {
    if (error.message === 'Session not found') {
      sendError(res, error.message, 'NOT_FOUND', 404);
      return;
    }
    if (error.message === 'Unauthorized') {
      sendError(res, error.message, 'UNAUTHORIZED', 403);
      return;
    }
    console.error('Clear messages error:', error);
    sendError(res, 'Failed to clear messages', 'DELETE_ERROR', 500);
  }
};
