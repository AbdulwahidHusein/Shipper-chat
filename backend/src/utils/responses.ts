import { Response } from 'express';

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
