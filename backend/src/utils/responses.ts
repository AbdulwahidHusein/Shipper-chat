import { Request, Response } from 'express';
import { User } from '@prisma/client';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    statusCode: number;
  };
  message?: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  if (message) {
    response.message = message;
  }
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  code: string,
  statusCode: number = 400
): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      statusCode,
    },
  };
  res.status(statusCode).json(response);
};

export const getAuthenticatedUser = (req: Request, res: Response): User | null => {
  if (!req.user) {
    sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
    return null;
  }
  return req.user as User;
};
