'use client';

import { useState } from 'react';
import { tokens } from '@/lib/design-tokens';
import Icon from '@/components/ui/Icon';
import Image from 'next/image';
import { format } from 'date-fns';
import { detectLinks } from '@/utils/link';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  isGrouped: boolean;
  showTimestamp: boolean;
  editingMessageId: string | null;
  editContent: string;
  onEdit: (messageId: string, content: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditContentChange: (content: string) => void;
  onDelete: (messageId: string) => void;
  formatTime: (date: Date) => string;
  messageRef?: (el: HTMLDivElement | null) => void;
}

// Helper function to render text with clickable links
function renderTextWithLinks(text: string, isCurrentUser: boolean) {
  const links = detectLinks(text);
  
  if (links.length === 0) {
    return <>{text}</>;
  }

  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  links.forEach((link, index) => {
    // Add text before the link
    if (link.startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, link.startIndex));
    }

    // Get original link text from message
    const originalLinkText = text.substring(link.startIndex, link.endIndex);

    // Add the link
    parts.push(
      <a
        key={`link-${index}`}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={{
          color: '#3b82f6', // Blue color for links
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        {originalLinkText}
      </a>
    );

    lastIndex = link.endIndex;
  });

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
}

export default function MessageBubble({
  message,
  isCurrentUser,
  isGrouped,
  showTimestamp,
  editingMessageId,
  editContent,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onEditContentChange,
  onDelete,
  formatTime,
  messageRef,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      ref={messageRef}
      data-message-id={message.id}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
      }}
    >
      {/* Message Bubble */}
      <div
        style={{
          backgroundColor: isCurrentUser
            ? tokens.colors.background.brandPrimary
            : tokens.colors.surface.default,
          padding: tokens.spacing[3], // 12px
          borderRadius: isGrouped
            ? isCurrentUser
              ? `${tokens.borderRadius.lg} ${tokens.borderRadius.base} ${tokens.borderRadius.base} ${tokens.borderRadius.lg}`
              : `${tokens.borderRadius.base} ${tokens.borderRadius.lg} ${tokens.borderRadius.lg} ${tokens.borderRadius.base}`
            : tokens.borderRadius.lg, // 12px
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[2],
          position: 'relative',
        }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Image/Video */}
        {message.type === 'IMAGE' || message.type === 'VIDEO' ? (
          <div
            style={{
              borderRadius: tokens.borderRadius.base,
              overflow: 'hidden',
              maxWidth: '100%',
            }}
          >
            {message.type === 'VIDEO' ? (
              <video
                src={message.content}
                controls
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  borderRadius: tokens.borderRadius.base,
                }}
              />
            ) : (
              <Image
                src={message.content}
                alt="Shared image"
                width={400}
                height={300}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: tokens.borderRadius.base,
                }}
              />
            )}
          </div>
        ) : message.type === 'FILE' ? (
          <div
            style={{
              display: 'flex',
              gap: tokens.spacing[2],
              alignItems: 'center',
              padding: tokens.spacing[2],
              backgroundColor: tokens.colors.surface.weak,
              borderRadius: tokens.borderRadius.base,
            }}
          >
            <Icon name="folder" size={20} color={tokens.colors.icon.secondary} />
            <a
              href={message.content}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...tokens.typography.styles.paragraphXSmall,
                color: tokens.colors.brand[500],
                textDecoration: 'underline',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {message.content.split('/').pop() || 'Download file'}
            </a>
          </div>
        ) : editingMessageId === message.id ? (
          // Edit mode
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[2],
            }}
          >
            <input
              type="text"
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onSaveEdit();
                } else if (e.key === 'Escape') {
                  onCancelEdit();
                }
              }}
              autoFocus
              style={{
                border: `1px solid ${tokens.colors.border.primary}`,
                borderRadius: tokens.borderRadius.base,
                padding: tokens.spacing[2],
                ...tokens.typography.styles.paragraphXSmall,
                color: tokens.colors.text.heading.primary,
                backgroundColor: tokens.colors.surface.default,
                outline: 'none',
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: tokens.spacing[2],
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={onCancelEdit}
                style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  border: `1px solid ${tokens.colors.border.primary}`,
                  borderRadius: tokens.borderRadius.base,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  ...tokens.typography.styles.labelSmall,
                  color: tokens.colors.text.heading.primary,
                }}
              >
                Cancel
              </button>
              <button
                onClick={onSaveEdit}
                style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  border: 'none',
                  borderRadius: tokens.borderRadius.base,
                  backgroundColor: tokens.colors.brand[500],
                  cursor: 'pointer',
                  ...tokens.typography.styles.labelSmall,
                  color: tokens.colors.text.neutral.white,
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}
          >
            <div
              style={{
                ...tokens.typography.styles.paragraphXSmall,
                color: isCurrentUser
                  ? tokens.colors.text.neutral.main
                  : tokens.colors.text.heading.primary,
                wordBreak: 'break-word',
              }}
            >
              {renderTextWithLinks(message.content, isCurrentUser)}
            </div>
            {isCurrentUser && (
              <div
                className="message-actions"
                style={{
                  display: 'flex',
                  gap: tokens.spacing[1],
                  opacity: showActions ? 1 : 0,
                  transition: 'opacity 0.2s',
                }}
              >
                <button
                  onClick={() => onEdit(message.id, message.content)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Icon
                    name="edit"
                    size={14}
                    color={tokens.colors.icon.secondary}
                  />
                </button>
                <button
                  onClick={() => onDelete(message.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Icon
                    name="trash"
                    size={14}
                    color={tokens.colors.icon.secondary}
                  />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timestamp and Read Receipt */}
      {showTimestamp && (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
            paddingTop: '4px',
          }}
        >
          {isCurrentUser && message.status && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: message.status === 'READ' ? '-4px' : '0',
              }}
            >
              {message.status === 'READ' ? (
                <>
                  <Icon
                    name="checks"
                    size={14}
                    color={tokens.colors.brand[500]}
                  />
                  <Icon
                    name="checks"
                    size={14}
                    color={tokens.colors.brand[500]}
                  />
                </>
              ) : message.status === 'DELIVERED' || message.status === 'SENT' ? (
                <Icon
                  name="checks"
                  size={14}
                  color={tokens.colors.text.placeholder}
                />
              ) : null}
            </div>
          )}
          <p
            style={{
              ...tokens.typography.styles.paragraphXSmall,
              color: tokens.colors.text.placeholder,
            }}
          >
            {formatTime(message.createdAt)}
          </p>
        </div>
      )}
    </div>
  );
}
