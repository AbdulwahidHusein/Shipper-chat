'use client';

import { useRef, useEffect } from 'react';
import { tokens } from '@/lib/design-tokens';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MessageBubble from './MessageBubble';
import DateDivider from './DateDivider';
import TypingIndicator from './TypingIndicator';
import { isToday } from '@/utils/date';
import { formatMessageTime } from '@/utils/date';
import type { Message } from '@/types';

interface MessageAreaProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string;
  editingMessageId: string | null;
  editContent: string;
  typingUsers: string[];
  onEdit: (messageId: string, content: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditContentChange: (content: string) => void;
  onDelete: (messageId: string) => void;
  messageRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessageArea({
  messages,
  loading,
  currentUserId,
  editingMessageId,
  editContent,
  typingUsers,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onEditContentChange,
  onDelete,
  messageRefs,
  messagesContainerRef,
}: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={messagesContainerRef}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[3], // 12px
        padding: tokens.spacing[3], // 12px
        backgroundColor: tokens.colors.background.primary,
        borderRadius: tokens.borderRadius.xl, // 16px
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: 0,
        position: 'relative',
      }}
    >
      {/* Messages Container - Wrapper to ensure proper scrolling */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[3], // 12px
          minHeight: 'min-content',
        }}
      >
        {/* Date Divider */}
        {messages.length > 0 && isToday(messages[0].createdAt) && (
          <DateDivider label="Today" />
        )}

        {/* Loading State */}
        {loading && messages.length === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: tokens.spacing[8],
              flexShrink: 0,
            }}
          >
            <LoadingSpinner size="md" message="Loading messages..." />
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === currentUserId;
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
          const isGrouped =
            prevMessage?.senderId === message.senderId &&
            message.createdAt.getTime() - prevMessage.createdAt.getTime() < 60000; // 1 minute
          const showTimestamp =
            !nextMessage ||
            nextMessage.senderId !== message.senderId ||
            nextMessage.createdAt.getTime() - message.createdAt.getTime() > 60000;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={isCurrentUser}
              isGrouped={isGrouped}
              showTimestamp={showTimestamp}
              editingMessageId={editingMessageId}
              editContent={editContent}
              onEdit={onEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onEditContentChange={onEditContentChange}
              onDelete={onDelete}
              formatTime={formatMessageTime}
              messageRef={(el) => {
                if (el) {
                  messageRefs.current.set(message.id, el);
                } else {
                  messageRefs.current.delete(message.id);
                }
              }}
            />
          );
        })}

        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Scroll anchor */}
        <div ref={messagesEndRef} style={{ flexShrink: 0 }} />
      </div>
    </div>
  );
}
