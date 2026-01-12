/**
 * ChatWindow Component
 * Matches Figma design - Chat header, message area, input area
 */

'use client';

// Add typing animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.7;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

import { useState, useEffect, useRef } from 'react';
import { tokens } from '@/lib/design-tokens';
import { useMessages } from '@/hooks/useMessages';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { uploadApi } from '@/lib/api-client';
import { sharedContentApi } from '@/lib/api-client';
import { messageApi } from '@/lib/api-client';
import type { ChatSession } from '@/types';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import Image from 'next/image';

// Helper function to get other participant
function getOtherParticipant(session: ChatSession, currentUserId: string) {
  if (session.participant1Id === currentUserId) {
    return session.participant2;
  }
  return session.participant1;
}

interface ChatWindowProps {
  sessionId?: string;
  onOpenContextMenu?: (sessionId: string, position: { x: number; y: number }) => void;
  onOpenContactInfo?: () => void;
}

export default function ChatWindow({ sessionId, onOpenContextMenu, onOpenContactInfo }: ChatWindowProps) {
  const { user } = useAuth();
  const { sessions } = useSessions();
  const { messages, loading, sendMessage: sendMessageApi, markAllRead, markMessageAsRead, refresh: refreshMessages } = useMessages(sessionId);
  const [messageInput, setMessageInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    thumbnailUrl: string;
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    name: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const readMessagesSet = useRef<Set<string>>(new Set());
  const { isConnected, emit, on } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map()); // userId -> userName
  const typingTimeoutsMap = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Scroll to bottom when messages change - only scroll the message container, not the page
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when session is selected
  useEffect(() => {
    if (sessionId) {
      // Reset read tracking when session changes
      readMessagesSet.current.clear();
      markAllRead();
    }
  }, [sessionId, markAllRead]);

  // Real-time read detection: Mark messages as read when they come into view
  useEffect(() => {
    if (!sessionId || !user || !messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId && !readMessagesSet.current.has(messageId)) {
              // Find the message
              const message = messages.find((m) => m.id === messageId);
              // Only mark as read if it's from another user and not already read
              if (
                message &&
                message.senderId !== user.id &&
                message.status !== 'READ'
              ) {
                readMessagesSet.current.add(messageId);
                markMessageAsRead(messageId);
              }
            }
          }
        });
      },
      {
        root: container,
        rootMargin: '0px',
        threshold: 0.5, // Mark as read when 50% visible
      }
    );

    // Observe all message elements
    const observeMessages = () => {
      messageRefs.current.forEach((element) => {
        if (element) {
          observer.observe(element);
        }
      });
    };

    // Observe after a small delay to ensure DOM is ready
    const timeoutId = setTimeout(observeMessages, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [messages, sessionId, user, markMessageAsRead]);

  // Typing detection
  useEffect(() => {
    if (!sessionId || !isConnected) return;

    const handleTypingStart = (data: any) => {
      if (data.sessionId === sessionId && data.userId !== user?.id) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data.userName);
          return newMap;
        });
        
        // Clear existing timeout
        const existingTimeout = typingTimeoutsMap.current.get(data.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
        
        // Auto-stop typing after 3 seconds
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(data.userId);
            return newMap;
          });
          typingTimeoutsMap.current.delete(data.userId);
        }, 3000);
        
        typingTimeoutsMap.current.set(data.userId, timeout);
      }
    };

    const handleTypingStop = (data: any) => {
      if (data.sessionId === sessionId && data.userId !== user?.id) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
        
        const timeout = typingTimeoutsMap.current.get(data.userId);
        if (timeout) {
          clearTimeout(timeout);
          typingTimeoutsMap.current.delete(data.userId);
        }
      }
    };

    const unsubscribeStart = on('typing:start', handleTypingStart);
    const unsubscribeStop = on('typing:stop', handleTypingStop);

    return () => {
      unsubscribeStart();
      unsubscribeStop();
      // Clear all timeouts
      typingTimeoutsMap.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsMap.current.clear();
    };
  }, [sessionId, isConnected, user?.id, on]);

  // Typing detection on input change
  useEffect(() => {
    if (!sessionId || !isConnected || !messageInput.trim()) {
      // Stop typing if input is empty
      if (sessionId && isConnected) {
        emit('typing:stop', { sessionId });
      }
      return;
    }

    // Emit typing start
    emit('typing:start', { sessionId });

    // Stop typing after 2 seconds of no input
    const timeout = setTimeout(() => {
      if (isConnected) {
        emit('typing:stop', { sessionId });
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [messageInput, sessionId, isConnected, emit]);

  // Notifications setup
  useEffect(() => {
    if (!user) return;

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

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

  const session = sessions.find((s) => s.id === sessionId);
  if (!session || !user) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tokens.colors.surface.default,
          borderRadius: tokens.borderRadius['2xl'],
        }}
      >
        <LoadingSpinner size="md" message="Loading conversation..." />
      </div>
    );
  }

  const otherParticipant = getOtherParticipant(session, user.id);

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
        await sendMessageApi(uploadData.url, messageType);
        
        // Clear preview and input
        setPreviewFile(null);
        setMessageInput('');
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

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !sessionId) return;
    
    // Stop typing
    if (isConnected) {
      emit('typing:stop', { sessionId });
    }
    
    const content = messageInput.trim();
    setMessageInput('');
    await sendMessageApi(content);
  };

  const handleEditMessage = async (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editContent.trim()) return;
    
    try {
      await messageApi.editMessage(editingMessageId, { content: editContent.trim() });
      setEditingMessageId(null);
      setEditContent('');
      // Message will be updated via WebSocket event
    } catch (error) {
      alert('Failed to edit message');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await messageApi.deleteMessage(messageId);
      // Message will be removed via WebSocket event
    } catch (error) {
      alert('Failed to delete message');
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
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
        <button
          onClick={onOpenContactInfo}
          style={{
            border: 'none',
            background: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <Avatar
            src={otherParticipant?.picture}
            name={otherParticipant?.name}
            size="md"
          />
        </button>
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
              color: otherParticipant?.isOnline
                ? tokens.colors.text.state.success
                : tokens.colors.text.placeholder,
            }}
          >
            {otherParticipant?.isOnline ? 'Online' : 'Offline'}
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                flexShrink: 0,
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
          const isCurrentUser = message.senderId === user.id;
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
              ref={(el) => {
                if (el) {
                  messageRefs.current.set(message.id, el);
                } else {
                  messageRefs.current.delete(message.id);
                }
              }}
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
                onMouseEnter={(e) => {
                  const actions = e.currentTarget.querySelector('.message-actions') as HTMLElement;
                  if (actions) actions.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  const actions = e.currentTarget.querySelector('.message-actions') as HTMLElement;
                  if (actions) actions.style.opacity = '0';
                }}
              >
                {/* Check if message is an image/video */}
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
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit();
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
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
                        onClick={handleCancelEdit}
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
                        onClick={handleSaveEdit}
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
                    {isCurrentUser && (
                      <div
                        className="message-actions"
                        style={{
                          display: 'flex',
                          gap: tokens.spacing[1],
                          opacity: 0,
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0';
                        }}
                      >
                        <button
                          onClick={() => handleEditMessage(message.id, message.content)}
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
                          onClick={() => handleDeleteMessage(message.id)}
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
                        // Double check marks for read
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
                        // Single check mark for delivered/sent
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
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              )}
            </div>
          );
        }          )}

          {/* Typing Indicator */}
          {typingUsers.size > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: tokens.spacing[2],
                paddingLeft: tokens.spacing[4],
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: tokens.colors.brand[500],
                    animation: 'typing 1.4s infinite',
                  }}
                />
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: tokens.colors.brand[500],
                    animation: 'typing 1.4s infinite 0.2s',
                  }}
                />
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: tokens.colors.brand[500],
                    animation: 'typing 1.4s infinite 0.4s',
                  }}
                />
              </div>
              <p
                style={{
                  ...tokens.typography.styles.paragraphXSmall,
                  color: tokens.colors.text.placeholder,
                  fontStyle: 'italic',
                }}
              >
                {Array.from(typingUsers.values()).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </p>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} style={{ flexShrink: 0 }} />
        </div>
      </div>

      {/* File Preview */}
      {previewFile && (
        <div
          style={{
            padding: tokens.spacing[3],
            borderTop: `1px solid ${tokens.colors.border.primary}`,
            display: 'flex',
            gap: tokens.spacing[3],
            alignItems: 'center',
          }}
        >
          {previewFile.type === 'IMAGE' ? (
            <Image
              src={previewFile.thumbnailUrl}
              alt="Preview"
              width={60}
              height={60}
              style={{
                borderRadius: tokens.borderRadius.base,
                objectFit: 'cover',
              }}
            />
          ) : previewFile.type === 'VIDEO' ? (
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
              {previewFile.name}
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
            onClick={() => setPreviewFile(null)}
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
      )}

      {/* Input Area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: tokens.spacing[2], // 8px
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

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
              onClick={handleAttachClick}
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
              onClick={handleSendMessage}
              disabled={uploading || (!messageInput.trim() && !previewFile)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: uploading || (!messageInput.trim() && !previewFile)
                  ? tokens.colors.surface.weak
                  : tokens.colors.brand[500],
                borderRadius: tokens.borderRadius.full,
                border: 'none',
                cursor: uploading || (!messageInput.trim() && !previewFile) ? 'not-allowed' : 'pointer',
                padding: '8px 10px',
              }}
            >
              <Icon
                name="send"
                size={16}
                color={
                  uploading || (!messageInput.trim() && !previewFile)
                    ? tokens.colors.icon.secondary
                    : tokens.colors.text.neutral.white
                }
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
