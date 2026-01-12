import { useState, useRef } from 'react';
import { uploadApi } from '@/lib/api-client';
import { sharedContentApi } from '@/lib/api-client';

interface FilePreview {
  url: string;
  thumbnailUrl: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  name: string;
}

interface UseFileUploadReturn {
  uploading: boolean;
  uploadProgress: number;
  previewFile: FilePreview | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearPreview: () => void;
  triggerFileInput: () => void;
}

export function useFileUpload(
  sessionId: string | undefined,
  onFileUploaded: (url: string, type: 'IMAGE' | 'VIDEO' | 'FILE') => Promise<void>
): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<FilePreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;

    // Validate file size
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 :
                    file.type.startsWith('image/') ? 10 * 1024 * 1024 :
                    25 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(`File size exceeds limit (${Math.round(maxSize / 1024 / 1024)}MB)`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadApi.uploadFile(file);

      if (response.success && response.data) {
        const uploadData = response.data;

        // Set preview
        setPreviewFile({
          url: uploadData.url,
          thumbnailUrl: uploadData.thumbnailUrl,
          type: uploadData.type,
          name: uploadData.originalName,
        });

        // If image or video, also save to shared media
        if (uploadData.type === 'IMAGE' || uploadData.type === 'VIDEO') {
          await sharedContentApi.shareMedia({
            type: uploadData.type,
            url: uploadData.url,
            thumbnailUrl: uploadData.thumbnailUrl,
            sessionId,
          });
        } else if (uploadData.type === 'DOCUMENT') {
          await sharedContentApi.shareDocument({
            name: uploadData.originalName,
            type: uploadData.format.toUpperCase() as any,
            size: uploadData.size,
            url: uploadData.url,
            sessionId,
          });
        }

        // Send message with file URL (convert DOCUMENT to FILE for message type)
        const messageType: 'IMAGE' | 'VIDEO' | 'FILE' = uploadData.type === 'DOCUMENT' ? 'FILE' : uploadData.type;
        await onFileUploaded(uploadData.url, messageType);

        // Clear preview and input
        setPreviewFile(null);
      } else {
        alert(response.error?.message || 'Upload failed');
      }
    } catch (error) {
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearPreview = () => {
    setPreviewFile(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    uploading,
    uploadProgress,
    previewFile,
    fileInputRef,
    handleFileSelect,
    clearPreview,
    triggerFileInput,
  };
}
