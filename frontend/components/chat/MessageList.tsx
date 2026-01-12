/**
 * MessageList Component
 * Matches Figma design - 400px width, conversation list with search
 */

'use client';

import { useState } from 'react';
import { tokens } from '@/lib/design-tokens';
import { mockSessions, currentUser, getOtherParticipant } from '@/data/mockData';
import type { ChatSession } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';
import { formatDistanceToNow } from 'date-fns';

interface MessageListProps {
  selectedSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewMessage: () => void;
  onOpenContextMenu?: (sessionId: string, position: { x: number; y: number }) => void;
}

export default function MessageList({
  selectedSessionId,
  onSelectSession,
  onNewMessage,
  onOpenContextMenu,
}: MessageListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
  const [swipedSessionId, setSwipedSessionId] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  const handleOpenContextMenu = (sessionId: string, e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const position = { x: clientX, y: clientY };
    
    if (onOpenContextMenu) {
      onOpenContextMenu(sessionId, position);
    }
  };

  const handleLongPressStart = (sessionId: string, e: React.TouchEvent) => {
    const timer = setTimeout(() => {
      handleOpenContextMenu(sessionId, e);
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleSwipeStart = (e: React.TouchEvent, sessionId: string) => {
    setSwipeStartX(e.touches[0].clientX);
    if (swipedSessionId === sessionId && swipeDirection) {
      // Already swiped, continue from current position
      setSwipeOffset(swipeDirection === 'left' ? 80 : -80);
    } else {
      setSwipeOffset(0);
      setSwipeDirection(null);
    }
  };

  const handleSwipeMove = (e: React.TouchEvent, sessionId: string) => {
    if (swipeStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = swipeStartX - currentX;
    const buttonWidth = 80;
    const threshold = 15; // Minimum movement to start revealing
    
    if (Math.abs(diff) < threshold) {
      // Not enough movement yet
      return;
    }
    
    if (diff > 0) {
      // Swiping left - reveal Archive (right side)
      if (swipeDirection !== 'left' && swipeDirection !== null) {
        // Switching directions, reset
        setSwipeOffset(0);
      }
      setSwipedSessionId(sessionId);
      setSwipeDirection('left');
      setSwipeOffset(Math.min(diff, buttonWidth));
    } else {
      // Swiping right - reveal Unread (left side)
      if (swipeDirection !== 'right' && swipeDirection !== null) {
        // Switching directions, reset
        setSwipeOffset(0);
      }
      setSwipedSessionId(sessionId);
      setSwipeDirection('right');
      setSwipeOffset(Math.max(diff, -buttonWidth));
    }
  };

  const handleSwipeEnd = (sessionId: string) => {
    const buttonWidth = 80;
    const revealThreshold = 35; // Minimum swipe to reveal (less aggressive)
    
    if (swipeDirection === 'left' && swipeOffset > revealThreshold) {
      // Swiped left enough - reveal Archive
      setSwipedSessionId(sessionId);
      setSwipeOffset(buttonWidth);
    } else if (swipeDirection === 'right' && Math.abs(swipeOffset) > revealThreshold) {
      // Swiped right enough - reveal Unread
      setSwipedSessionId(sessionId);
      setSwipeOffset(-buttonWidth);
    } else {
      // Not enough swipe - smoothly snap back
      setSwipedSessionId(null);
      setSwipeOffset(0);
      setSwipeDirection(null);
    }
    setSwipeStartX(null);
  };

  const handleArchiveClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    console.log('Archive chat:', sessionId);
    // TODO: Implement archive functionality
    setSwipedSessionId(null);
    setSwipeOffset(0);
    setSwipeDirection(null);
  };

  const handleMarkUnreadClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    console.log('Mark as unread:', sessionId);
    // TODO: Implement mark as unread functionality
    setSwipedSessionId(null);
    setSwipeOffset(0);
    setSwipeDirection(null);
  };

  const resetSwipe = () => {
    setSwipedSessionId(null);
    setSwipeOffset(0);
    setSwipeDirection(null);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour ago`;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const filteredSessions = mockSessions.filter((session) => {
    if (!searchQuery) return true;
    const otherParticipant = getOtherParticipant(session, currentUser.id);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div
      style={{
        backgroundColor: tokens.colors.surface.default,
        display: 'flex',
        flexDirection: 'column',
        height: '932px',
        width: tokens.dimensions.messageList.width, // 400px
        padding: tokens.spacing[6], // 24px
        borderRadius: tokens.borderRadius['2xl'], // 24px
        gap: tokens.spacing[6], // 24px
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <h2
          style={{
            ...tokens.typography.styles.subheadlineSemibold,
            color: tokens.colors.text.neutral.main,
          }}
        >
          All Message
        </h2>
        <Button
          variant="primary"
          size="sm"
          icon="pencil-plus"
          onClick={onNewMessage}
        >
          New Message
        </Button>
      </div>

      {/* Search and Filter */}
      <div
        style={{
          display: 'flex',
          gap: tokens.spacing[4], // 16px
          alignItems: 'center',
        }}
      >
        <Input
          type="search"
          placeholder="Search in message"
          icon="search"
          size="md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            backgroundColor: tokens.colors.surface.default,
            border: `1px solid ${tokens.colors.border.primary}`,
            borderRadius: tokens.borderRadius.md, // 10px
            cursor: 'pointer',
            padding: '10px',
          }}
        >
          <Icon name="filter" size={18} color={tokens.colors.icon.secondary} />
        </button>
      </div>

      {/* Conversation List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[2], // 8px
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {filteredSessions.map((session) => {
          const otherParticipant = getOtherParticipant(session, currentUser.id);
          const isSelected = selectedSessionId === session.id;
          const hasUnread = (session.unreadCount || 0) > 0;

          const isHovered = hoveredSessionId === session.id;
          const isSwiped = swipedSessionId === session.id;
          // Show Archive on hover (desktop) or swipe left (mobile)
          const showArchiveButton = (isHovered && !isSwiped) || (isSwiped && swipeDirection === 'left' && swipeOffset >= 0);
          // Show Unread only on swipe right (mobile)
          const showUnreadButton = isSwiped && swipeDirection === 'right' && swipeOffset < 0;

          return (
            <div
              key={session.id}
              style={{
                display: 'flex',
                gap: tokens.spacing[2], // 8px
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={() => setHoveredSessionId(session.id)}
              onMouseLeave={() => setHoveredSessionId(null)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  position: 'relative',
                  transform: isSwiped ? `translateX(${swipeOffset}px)` : 'translateX(0)',
                  transition: isSwiped ? 'none' : 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onTouchStart={(e) => {
                  handleSwipeStart(e, session.id);
                  handleLongPressStart(session.id, e);
                }}
                onTouchMove={(e) => {
                  handleSwipeMove(e, session.id);
                }}
                onTouchEnd={(e) => {
                  handleSwipeEnd(session.id);
                  handleLongPressEnd();
                }}
                onTouchCancel={(e) => {
                  handleSwipeEnd(session.id);
                  handleLongPressEnd();
                }}
              >
                <button
                  onClick={() => {
                    if (!isSwiped) {
                      onSelectSession(session.id);
                    } else {
                      // Reset swipe if clicking while swiped
                      resetSwipe();
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleOpenContextMenu(session.id, e);
                  }}
                  style={{
                    display: 'flex',
                    gap: tokens.spacing[3], // 12px
                    alignItems: 'center',
                    padding: tokens.spacing[3], // 12px
                    borderRadius: tokens.borderRadius.lg, // 12px
                    width: '100%',
                    backgroundColor: isSelected
                      ? tokens.colors.background.primary
                      : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = tokens.colors.surface.weak;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
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
                    minWidth: 0,
                  }}
                >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <p
                    style={{
                      ...tokens.typography.styles.labelSmall,
                      color: tokens.colors.text.heading.primary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {otherParticipant?.name}
                  </p>
                  <p
                    style={{
                      ...tokens.typography.styles.paragraphXSmall,
                      color: tokens.colors.text.placeholder,
                    }}
                  >
                    {session.lastMessage
                      ? formatTime(session.lastMessage.createdAt)
                      : ''}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: hasUnread ? tokens.spacing[4] : tokens.spacing[2],
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <p
                    style={{
                      ...tokens.typography.styles.paragraphXSmall,
                      color: tokens.colors.text.placeholder,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {session.lastMessage?.content || 'No messages yet'}
                  </p>
                  {hasUnread && (
                    <Icon
                      name="checks"
                      size={16}
                      color={tokens.colors.text.placeholder}
                    />
                  )}
                </div>
              </div>
            </button>
            {/* Three-dot menu button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                handleOpenContextMenu(session.id, {
                  ...e,
                  clientX: rect.right,
                  clientY: rect.bottom,
                } as React.MouseEvent);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: tokens.borderRadius.base, // 8px
                opacity: isSelected ? 1 : 0,
                transition: 'opacity 0.2s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.opacity = '0';
                }
              }}
            >
              <Icon name="dots" size={18} color={tokens.colors.icon.secondary} />
            </button>
              </div>
              
              {/* Mark as Unread Quick Action Button (Left Side) */}
              <button
                onClick={(e) => handleMarkUnreadClick(e, session.id)}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: showUnreadButton ? '0' : '-80px',
                  top: '0',
                  width: '80px',
                  height: '100%',
                  backgroundColor: tokens.colors.text.neutral.sub,
                  border: 'none',
                  borderRadius: tokens.borderRadius.lg, // 12px
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 1,
                  padding: tokens.spacing[2], // 8px
                }}
              >
                <Icon name="message-circle-2" size={20} color={tokens.colors.text.neutral.white} />
                <span
                  style={{
                    ...tokens.typography.styles.labelXSmall,
                    color: tokens.colors.text.neutral.white,
                    fontSize: '12px',
                    lineHeight: '14px',
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}
                >
                  Unread
                </span>
              </button>

              {/* Archive Quick Action Button (Right Side) */}
              <button
                onClick={(e) => handleArchiveClick(e, session.id)}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  right: showArchiveButton ? '0' : '-80px',
                  top: '0',
                  width: '80px',
                  height: '100%',
                  backgroundColor: tokens.colors.brand[500],
                  border: 'none',
                  borderRadius: tokens.borderRadius.lg, // 12px
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'right 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 1,
                  padding: tokens.spacing[2], // 8px
                }}
              >
                <Icon name="archive" size={20} color={tokens.colors.text.neutral.white} />
                <span
                  style={{
                    ...tokens.typography.styles.labelXSmall,
                    color: tokens.colors.text.neutral.white,
                    fontSize: '12px',
                    lineHeight: '14px',
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}
                >
                  Archive
                </span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
