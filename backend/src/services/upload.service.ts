/**
 * Upload Service
 * Clean, professional file upload handling with Cloudinary
 */

import cloudinary from '../config/cloudinary';
import { MediaType, DocumentType } from '@prisma/client';

export interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
}

/**
 * Upload image to Cloudinary
 */
export const uploadImage = async (
  fileBuffer: Buffer,
  folder: string = 'shipper/images'
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          {
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Image upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error('Image upload failed: No result returned'));
          return;
        }

        resolve({
          url: result.secure_url,
          thumbnailUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload video to Cloudinary
 */
export const uploadVideo = async (
  fileBuffer: Buffer,
  folder: string = 'shipper/videos'
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'video',
        transformation: [
          {
            quality: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Video upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error('Video upload failed: No result returned'));
          return;
        }

        // Generate thumbnail for video
        const thumbnailUrl = cloudinary.url(result.public_id, {
          resource_type: 'video',
          format: 'jpg',
          transformation: [
            {
              width: 400,
              height: 300,
              crop: 'fill',
            },
          ],
        });

        resolve({
          url: result.secure_url,
          thumbnailUrl,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload file/document to Cloudinary
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'shipper/documents'
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        public_id: fileName,
      },
      (error, result) => {
        if (error) {
          reject(new Error(`File upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error('File upload failed: No result returned'));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Determine file type from MIME type
 */
export const getFileType = (mimeType: string): {
  mediaType?: MediaType;
  documentType?: DocumentType;
  isImage: boolean;
  isVideo: boolean;
  isDocument: boolean;
} => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const documentTypes: Record<string, DocumentType> = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/fig': 'FIG',
    'application/postscript': 'AI',
    'image/vnd.adobe.photoshop': 'PSD',
    'application/vnd.adobe.xd+xml': 'XD',
    'application/vnd.sketch': 'SKETCH',
  };

  if (imageTypes.includes(mimeType)) {
    return {
      mediaType: 'IMAGE',
      isImage: true,
      isVideo: false,
      isDocument: false,
    };
  }

  if (videoTypes.includes(mimeType)) {
    return {
      mediaType: 'VIDEO',
      isImage: false,
      isVideo: true,
      isDocument: false,
    };
  }

  const docType = documentTypes[mimeType];
  if (docType) {
    return {
      documentType: docType,
      isImage: false,
      isVideo: false,
      isDocument: true,
    };
  }

  return {
    isImage: false,
    isVideo: false,
    isDocument: false,
  };
};
