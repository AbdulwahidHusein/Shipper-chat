/**
 * ChatWindow Component
 * Matches Figma design - Chat header, message area, input area
 */

'use client';

import { useState } from 'react';
import { tokens } from '@/lib/design-tokens';
import { getMessagesForSession, getOtherParticipant, mockSessions, currentUser } from '@/data/mockData';
import type { ChatSession, Message } from '@/types';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import { format } from 'date-fns';

interface ChatWindowProps {
  sessionId?: string;
  onOpenContextMenu?: (sessionId: string, position: { x: number; y: number }) => void;
}

export default function ChatWindow({ sessionId, onOpenContextMenu }: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('');

  if (!sessionId) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tokens.colors.surface.default,
          borderRadius: tokens.borderRadius['2xl'], // 24px
          height: '100%',
        }}
      >
        <p
          style={{
            ...tokens.typography.styles.paragraphSmall,
            color: tokens.colors.text.placeholder,
          }}
        >
          Select a conversation to start chatting
        </p>
      </div>
    );
  }

  const session = mockSessions.find((s) => s.id === sessionId);
  if (!session) return null;

  const otherParticipant = getOtherParticipant(session, currentUser.id);
  const messages = getMessagesForSession(sessionId);

  const formatMessageTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // TODO: Implement message sending
    setMessageInput('');
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: tokens.colors.surface.default,
        borderRadius: tokens.borderRadius['2xl'], // 24px
        padding: tokens.spacing[3], // 12px
        overflow: 'hidden',
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          display: 'flex',
          gap: tokens.spacing[3], // 12px
          alignItems: 'center',
          padding: `4px ${tokens.spacing[3]} ${tokens.spacing[4]} ${tokens.spacing[3]}`, // 4px 12px 16px 12px
          borderBottom: `1px solid ${tokens.colors.border.primary}`,
        }}
      >
        <Avatar
          src={otherParticipant?.picture}
          name={otherParticipant?.name}
          size="md"
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flex: 1,
          }}
        >
          <p
            style={{
              ...tokens.typography.styles.labelSmall,
              color: tokens.colors.text.neutral.main,
            }}
          >
            {otherParticipant?.name}
          </p>
          <p
            style={{
              ...tokens.typography.styles.paragraphXSmall,
              color: tokens.colors.text.state.success,
            }}
          >
            Online
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: tokens.spacing[3], // 12px
            alignItems: 'center',
          }}
        >
          {['search', 'phone', 'video'].map((iconName) => (
            <button
              key={iconName}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: tokens.colors.surface.default,
                border: `1px solid ${tokens.colors.border.primary}`,
                borderRadius: tokens.borderRadius.base, // 8px
                cursor: 'pointer',
              }}
            >
              <Icon
                name={iconName as any}
                size={16}
                color={tokens.colors.icon.secondary}
              />
            </button>
          ))}
          <button
            onClick={(e) => {
              if (onOpenContextMenu && sessionId) {
                const rect = e.currentTarget.getBoundingClientRect();
                onOpenContextMenu(sessionId, {
                  x: rect.right,
                  y: rect.bottom,
                });
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: tokens.colors.surface.default,
              border: `1px solid ${tokens.colors.border.primary}`,
              borderRadius: tokens.borderRadius.base, // 8px
              cursor: 'pointer',
            }}
          >
            <Icon
              name="dots"
              size={16}
              color={tokens.colors.icon.secondary}
            />
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[3], // 12px
          padding: tokens.spacing[3], // 12px
          backgroundColor: tokens.colors.background.primary,
          borderRadius: tokens.borderRadius.xl, // 16px
          overflowY: 'auto',
          justifyContent: 'flex-end',
        }}
      >
        {/* Date Divider */}
        {messages.length > 0 && isToday(messages[0].createdAt) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                backgroundColor: tokens.colors.surface.default,
                padding: '4px 12px',
                borderRadius: tokens.borderRadius.pill, // 60px
              }}
            >
              <p
                style={{
                  ...tokens.typography.styles.labelSmall,
                  color: tokens.colors.text.neutral.sub,
                }}
              >
                Today
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === currentUser.id;
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
            <div
              key={message.id}
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
                }}
              >
                <p
                  style={{
                    ...tokens.typography.styles.paragraphXSmall,
                    color: isCurrentUser
                      ? tokens.colors.text.neutral.main
                      : tokens.colors.text.heading.primary,
                  }}
                >
                  {message.content}
                </p>
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
                  {isCurrentUser && message.isRead && (
                    <Icon
                      name="checks"
                      size={14}
                      color={tokens.colors.brand[500]}
                    />
                  )}
                  <p
                    style={{
                      ...tokens.typography.styles.paragraphXSmall,
                      color: tokens.colors.text.placeholder,
                    }}
                  >
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Area */}
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
            paddingY: tokens.spacing[3], // 12px
            border: `1px solid ${tokens.colors.border.primary}`,
            borderRadius: tokens.borderRadius.full, // 100px
            backgroundColor: tokens.colors.surface.default,
          }}
        >
          <input
            type="text"
            placeholder="Type any message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
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
            {['microphone', 'emoji', 'paperclip'].map((iconName) => (
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
              onClick={handleSendMessage}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: tokens.colors.brand[500],
                borderRadius: tokens.borderRadius.full,
                border: 'none',
                cursor: 'pointer',
                padding: '8px 10px',
              }}
            >
              <Icon
                name="send"
                size={16}
                color={tokens.colors.text.neutral.white}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
