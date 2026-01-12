'use client';

import { useRef } from 'react';
import { tokens } from '@/lib/design-tokens';
import Icon from '@/components/ui/Icon';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttach: () => void;
  uploading: boolean;
  hasPreview: boolean;
}

export default function MessageInput({
  value,
  onChange,
  onSend,
  onAttach,
  uploading,
  hasPreview,
}: MessageInputProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingTop: tokens.spacing[2], // 8px
      }}
    >
      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: '4px',
          alignItems: 'center',
          height: '40px',
          paddingLeft: tokens.spacing[4], // 16px
          paddingRight: '4px',
          paddingTop: tokens.spacing[3], // 12px
          paddingBottom: tokens.spacing[3], // 12px
          border: `1px solid ${tokens.colors.border.primary}`,
          borderRadius: tokens.borderRadius.full, // 100px
          backgroundColor: tokens.colors.surface.default,
        }}
      >
        <input
          type="text"
          placeholder="Type any message..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSend();
            }
          }}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            ...tokens.typography.styles.paragraphXSmall,
            color: tokens.colors.text.neutral.soft,
            fontFamily: tokens.typography.fontFamily.sans.join(', '),
          }}
        />
        <div
          style={{
            display: 'flex',
            gap: tokens.spacing[2], // 8px
            alignItems: 'center',
          }}
        >
          {['microphone', 'emoji'].map((iconName) => (
            <button
              key={iconName}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                padding: '8px 10px',
                borderRadius: tokens.borderRadius.full,
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              <Icon
                name={iconName as any}
                size={14}
                color={tokens.colors.icon.secondary}
              />
            </button>
          ))}
          <button
            onClick={onAttach}
            disabled={uploading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              padding: '8px 10px',
              borderRadius: tokens.borderRadius.full,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.5 : 1,
            }}
          >
            <Icon
              name="paperclip"
              size={14}
              color={tokens.colors.icon.secondary}
            />
          </button>
          <button
            onClick={onSend}
            disabled={uploading || (!value.trim() && !hasPreview)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: uploading || (!value.trim() && !hasPreview)
                ? tokens.colors.surface.weak
                : tokens.colors.brand[500],
              borderRadius: tokens.borderRadius.full,
              border: 'none',
              cursor: uploading || (!value.trim() && !hasPreview) ? 'not-allowed' : 'pointer',
              padding: '8px 10px',
            }}
          >
            <Icon
              name="send"
              size={16}
              color={
                uploading || (!value.trim() && !hasPreview)
                  ? tokens.colors.icon.secondary
                  : tokens.colors.text.neutral.white
              }
            />
          </button>
        </div>
      </div>
    </div>
  );
}
