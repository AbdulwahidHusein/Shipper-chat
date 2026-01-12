import { Request, Response } from 'express';
import { findUserById } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/responses';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  picture: z.string().url().optional(),
});

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await findUserById(userId);

    if (!user) {
      sendError(res, 'User not found', 'USER_NOT_FOUND', 404);
      return;
    }

    // Return public profile (no sensitive data)
    const { id, name, picture, isOnline, lastSeen } = user;
    sendSuccess(res, {
      id,
      name,
      picture,
      isOnline,
      lastSeen,
    });
  } catch (error) {
    sendError(res, 'Failed to fetch user profile', 'FETCH_ERROR', 500);
  }
};

export const updateOwnProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    // Validate input
    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      sendError(res, 'Invalid input data', 'VALIDATION_ERROR', 400);
      return;
    }

    const { updateUser } = await import('../services/user.service');
    const updatedUser = await updateUser(req.user.id, validation.data);

    const { id, email, name, picture, isOnline, lastSeen } = updatedUser;
    sendSuccess(res, {
      id,
      email,
      name,
      picture,
      isOnline,
      lastSeen,
    });
  } catch (error) {
    sendError(res, 'Failed to update profile', 'UPDATE_ERROR', 500);
  }
};
