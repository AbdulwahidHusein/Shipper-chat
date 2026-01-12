import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';
import { findUserById } from '../services/user.service';
import { sendError } from '../utils/responses';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookie first
    let token = req.cookies?.token;

    // If no cookie, try Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user in database
    const user = await findUserById(decoded.userId);

    if (!user) {
      sendError(res, 'User not found', 'USER_NOT_FOUND', 404);
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token', 'INVALID_TOKEN', 401);
  }
};
