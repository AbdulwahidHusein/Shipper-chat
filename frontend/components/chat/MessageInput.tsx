'use client';

import { useState, useRef, useEffect } from 'react';
import { tokens } from '@/lib/design-tokens';
import Icon from '@/components/ui/Icon';
import EmojiPicker from '@/components/ui/EmojiPicker';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiSelect = (emoji: string) => {
    onChange(value + emoji);
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        emojiButtonRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingTop: tokens.spacing[2], // 8px
        position: 'relative',
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
          {/* Microphone button */}
          <button
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
              name="microphone"
              size={14}
              color={tokens.colors.icon.secondary}
            />
          </button>

          {/* Emoji button with picker */}
          <div ref={emojiPickerRef} style={{ position: 'relative' }}>
            <button
              ref={emojiButtonRef}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                padding: '8px 10px',
                borderRadius: tokens.borderRadius.full,
                border: 'none',
                backgroundColor: showEmojiPicker ? tokens.colors.surface.weak : 'transparent',
                cursor: 'pointer',
              }}
            >
              <Icon
                name="emoji"
                size={14}
                color={tokens.colors.icon.secondary}
              />
            </button>
            {showEmojiPicker && (
              <EmojiPicker
                onSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>
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
