/**
 * Upload Controller
 * Clean, professional file upload endpoints
 */

import { Request, Response } from 'express';
import {
  uploadImage as uploadImageService,
  uploadVideo as uploadVideoService,
  uploadFile as uploadFileService,
  getFileType,
} from '../services/upload.service';
import { sendSuccess, sendError } from '../utils/responses';

export const uploadFileHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      return;
    }

    if (!req.file) {
      sendError(res, 'No file provided', 'VALIDATION_ERROR', 400);
      return;
    }

    const file = req.file;
    const fileType = getFileType(file.mimetype);

    let result;

    if (fileType.isImage) {
      result = await uploadImageService(file.buffer);
    } else if (fileType.isVideo) {
      result = await uploadVideoService(file.buffer);
    } else if (fileType.isDocument) {
      result = await uploadFileService(file.buffer, file.originalname);
    } else {
      sendError(res, 'Unsupported file type', 'VALIDATION_ERROR', 400);
      return;
    }

    sendSuccess(res, {
      url: result.url,
      thumbnailUrl: result.thumbnailUrl || result.url,
      publicId: result.publicId,
      type: fileType.isImage
        ? 'IMAGE'
        : fileType.isVideo
        ? 'VIDEO'
        : 'DOCUMENT',
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      originalName: file.originalname,
    });
  } catch (error: any) {
    sendError(
      res,
      error.message || 'File upload failed',
      'UPLOAD_ERROR',
      500
    );
  }
};
