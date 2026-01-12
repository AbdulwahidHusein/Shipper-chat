'use client';

import { tokens } from '@/lib/design-tokens';
import Icon from '@/components/ui/Icon';
import Image from 'next/image';

interface FilePreviewProps {
  file: {
    url: string;
    thumbnailUrl: string;
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    name: string;
  };
  uploading: boolean;
  uploadProgress: number;
  onRemove: () => void;
}

export default function FilePreview({
  file,
  uploading,
  uploadProgress,
  onRemove,
}: FilePreviewProps) {
  return (
    <div
      style={{
        padding: tokens.spacing[3],
        borderTop: `1px solid ${tokens.colors.border.primary}`,
        display: 'flex',
        gap: tokens.spacing[3],
        alignItems: 'center',
      }}
    >
      {file.type === 'IMAGE' ? (
        <Image
          src={file.thumbnailUrl}
          alt="Preview"
          width={60}
          height={60}
          style={{
            borderRadius: tokens.borderRadius.base,
            objectFit: 'cover',
          }}
        />
      ) : file.type === 'VIDEO' ? (
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: tokens.borderRadius.base,
            backgroundColor: tokens.colors.surface.weak,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="video" size={24} color={tokens.colors.icon.secondary} />
        </div>
      ) : (
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: tokens.borderRadius.base,
            backgroundColor: tokens.colors.surface.weak,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="folder" size={24} color={tokens.colors.icon.secondary} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            ...tokens.typography.styles.labelSmall,
            color: tokens.colors.text.heading.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {file.name}
        </p>
        <p
          style={{
            ...tokens.typography.styles.paragraphXSmall,
            color: tokens.colors.text.placeholder,
          }}
        >
          {uploading ? `Uploading... ${uploadProgress}%` : 'Ready to send'}
        </p>
      </div>
      <button
        onClick={onRemove}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
        }}
      >
        <Icon name="x" size={16} color={tokens.colors.icon.secondary} />
      </button>
    </div>
  );
}
