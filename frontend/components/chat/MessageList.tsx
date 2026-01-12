/**
 * MessageList Component
 * Matches Figma design - 400px width, conversation list with search
 */

'use client';

import { useState } from 'react';
import { tokens } from '@/lib/design-tokens';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatSession } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

// Helper function to get other participant
function getOtherParticipant(session: ChatSession, currentUserId: string) {
  if (session.participant1Id === currentUserId) {
    return session.participant2;
  }
  return session.participant1;
}

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
  const { user } = useAuth();
  const { sessions, loading, archiveSession, markUnread } = useSessions();
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

  const handleArchiveClick = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    await archiveSession(sessionId);
    setSwipedSessionId(null);
    setSwipeOffset(0);
    setSwipeDirection(null);
  };

  const handleMarkUnreadClick = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    await markUnread(sessionId);
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

  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery || !user) return true;
    const otherParticipant = getOtherParticipant(session, user.id);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: tokens.colors.surface.default,
          display: 'flex',
          flexDirection: 'column',
          height: '932px',
          width: tokens.dimensions.messageList.width,
          padding: tokens.spacing[6],
          borderRadius: tokens.borderRadius['2xl'],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoadingSpinner size="md" message="Loading conversations..." />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: tokens.colors.surface.default,
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 auto',
        width: tokens.dimensions.messageList.width, // 400px
        padding: tokens.spacing[6], // 24px
        borderRadius: tokens.borderRadius['2xl'], // 24px
        gap: tokens.spacing[6], // 24px
        minHeight: 0,
        overflow: 'hidden',
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
          overflowX: 'hidden',
          flex: 1,
          minHeight: 0,
        }}
      >
        {filteredSessions.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: tokens.spacing[8],
              gap: tokens.spacing[2],
            }}
          >
            <p
              style={{
                ...tokens.typography.styles.paragraphSmall,
                color: tokens.colors.text.placeholder,
                textAlign: 'center',
              }}
            >
              No conversations yet
            </p>
            <p
              style={{
                ...tokens.typography.styles.paragraphXSmall,
                color: tokens.colors.text.placeholder,
                textAlign: 'center',
              }}
            >
              Start a new conversation to get started
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            if (!user) return null;
            const otherParticipant = getOtherParticipant(session, user.id);
          const isSelected = selectedSessionId === session.id;
          const hasUnread = (session.unreadCount || 0) > 0;

          const isHovered = hoveredSessionId === session.id;
          const isSwiped = swipedSessionId === session.id;
          // Show Archive only on swipe left (mobile) - NOT on hover to avoid clutter
          const showArchiveButton = isSwiped && swipeDirection === 'left' && swipeOffset >= 0;
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
                width: '100%',
              }}
              onMouseEnter={() => setHoveredSessionId(session.id)}
              onMouseLeave={() => {
                setHoveredSessionId(null);
                // Reset swipe state on mouse leave if not actively swiping
                if (swipedSessionId === session.id && swipeStartX === null) {
                  setSwipedSessionId(null);
                  setSwipeOffset(0);
                  setSwipeDirection(null);
                }
              }}
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
                  {/* Show read status if last message is from current user and is read */}
                  {session.lastMessage?.senderId === user?.id && session.lastMessage?.status === 'READ' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '-4px',
                      }}
                    >
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
                    </div>
                  )}
                  {/* Show unread indicator if there are unread messages */}
                  {hasUnread && session.lastMessage?.senderId !== user?.id && (
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
              
              {/* Mark as Unread Quick Action Button (Left Side) - Only on swipe */}
              {showUnreadButton && (
                <button
                  onClick={(e) => handleMarkUnreadClick(e, session.id)}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    left: '0',
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
                    zIndex: 2,
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
              )}

              {/* Archive Quick Action Button (Right Side) - Only on swipe */}
              {showArchiveButton && (
                <button
                  onClick={(e) => handleArchiveClick(e, session.id)}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    right: '0',
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
                    zIndex: 2,
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
              )}
            </div>
          );
          })
        )}
      </div>

    </div>
  );
}
