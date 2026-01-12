import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responses';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    sendError(res, 'Database error occurred', 'DATABASE_ERROR', 500);
    return;
  }

  // JWT errors
  if (err.message.includes('token')) {
    sendError(res, err.message, 'INVALID_TOKEN', 401);
    return;
  }

  // Default error
  sendError(res, err.message || 'Internal server error', 'INTERNAL_ERROR', 500);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 'NOT_FOUND', 404);
};
