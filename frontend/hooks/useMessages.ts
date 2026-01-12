/**
 * useMessages Hook
 * Clean, professional message data management with WebSocket support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { messageApi } from '@/lib/api-client';
import { useSocket } from './useSocket';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/types';

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  sendMessage: (content: string, type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'LINK') => Promise<Message | null>;
  markAllRead: () => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMessages(sessionId: string | undefined): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { isConnected, emit, on, off } = useSocket();
  const { user } = useAuth();
  const sessionIdRef = useRef(sessionId);

  const fetchMessages = useCallback(
    async (reset: boolean = false) => {
      if (!sessionId) {
        setMessages([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await messageApi.getMessages(sessionId, 50, reset ? undefined : cursor);
        if (response.success && response.data) {
          const data = response.data as { messages: any[]; nextCursor: string | null };
          const transformedMessages = data.messages.map((msg) => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
            readAt: msg.readAt ? new Date(msg.readAt) : undefined,
            sender: msg.sender,
            type: msg.type || 'TEXT',
            status: msg.status || 'SENT',
          }));

          if (reset) {
            setMessages(transformedMessages);
          } else {
            setMessages((prev) => [...prev, ...transformedMessages]);
          }

          setCursor(data.nextCursor || undefined);
          setHasMore(!!data.nextCursor);
        } else {
          setError(response.error?.message || 'Failed to fetch messages');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    },
    [sessionId, cursor]
  );

  // Update ref when sessionId changes
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Fetch messages when session changes
  useEffect(() => {
    setMessages([]);
    setCursor(undefined);
    setHasMore(true);
    fetchMessages(true);
  }, [sessionId, fetchMessages]);

  // WebSocket event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Listen for new messages (only from other users, not our own)
    const handleNewMessage = (data: any) => {
      // Only add if it's for the current session AND not from current user
      if (data.sessionId === sessionIdRef.current && data.senderId !== user?.id) {
        const newMessage: Message = {
          id: data.id,
          content: data.content,
          senderId: data.senderId,
          sessionId: data.sessionId,
          type: data.type,
          status: data.status,
          createdAt: new Date(data.createdAt),
          sender: data.sender,
        };
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });

        // Show notification if page is not visible
        if ('Notification' in window && Notification.permission === 'granted') {
          if (document.hidden) {
            new Notification(data.sender?.name || 'New message', {
              body: data.content,
              icon: data.sender?.picture || '/favicon.ico',
              tag: data.id,
            });
          }
        }
      }
    };

    // Listen for message sent confirmation (only for our own messages)
    const handleMessageSent = (data: any) => {
      if (data.sessionId === sessionIdRef.current) {
        // Replace optimistic message with real message from server
        setMessages((prev) => {
          // Remove optimistic message (temp-* id)
          const filtered = prev.filter((msg) => !msg.id.startsWith('temp-'));
          // Update the message with real ID and keep it on the right (sender's side)
          const existingIndex = filtered.findIndex((msg) => 
            msg.content === data.content && 
            msg.senderId === user?.id &&
            Math.abs(msg.createdAt.getTime() - new Date(data.createdAt).getTime()) < 5000 // Within 5 seconds
          );
          
          if (existingIndex >= 0) {
            // Update existing message with real ID
            const updated = [...filtered];
            updated[existingIndex] = {
              ...updated[existingIndex],
              id: data.id,
              type: data.type || 'TEXT',
              createdAt: new Date(data.createdAt),
            };
            return updated;
          }
          
          // If not found, add it (shouldn't happen, but safety check)
          if (!filtered.some((msg) => msg.id === data.id)) {
            return [
              ...filtered,
              {
                id: data.id,
                content: data.content,
                senderId: user?.id || '',
                sessionId: data.sessionId,
                type: data.type || 'TEXT',
                status: 'SENT',
                createdAt: new Date(data.createdAt),
                sender: {
                  id: user?.id || '',
                  name: user?.name || '',
                  picture: user?.picture || null,
                },
              },
            ];
          }
          return filtered;
        });
      }
    };

    // Listen for message status updates
    const handleMessageStatus = (data: any) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            return {
              ...msg,
              status: data.status,
              readAt: data.readAt ? new Date(data.readAt) : msg.readAt,
              isRead: data.status === 'READ',
            };
          }
          return msg;
        })
      );
    };

    // Listen for message updates (edits)
    const handleMessageUpdate = (data: any) => {
      if (data.sessionId === sessionIdRef.current) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === data.id) {
              return {
                ...msg,
                content: data.content,
              };
            }
            return msg;
          })
        );
      }
    };

    // Listen for message deletions
    const handleMessageDelete = (data: any) => {
      if (data.sessionId === sessionIdRef.current) {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
      }
    };

    const unsubscribeNew = on('message:new', handleNewMessage);
    const unsubscribeSent = on('message:sent', handleMessageSent);
    const unsubscribeStatus = on('message:status', handleMessageStatus);
    const unsubscribeUpdate = on('message:update', handleMessageUpdate);
    const unsubscribeDelete = on('message:delete', handleMessageDelete);

    return () => {
      unsubscribeNew();
      unsubscribeSent();
      unsubscribeStatus();
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, [isConnected, on, sessionId, user?.id]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchMessages(false);
  }, [hasMore, loading, fetchMessages]);

  const sendMessage = useCallback(
    async (content: string, messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'LINK' = 'TEXT'): Promise<Message | null> => {
      if (!sessionId) return null;

      // Use WebSocket if connected, otherwise fallback to REST
      if (isConnected) {
        // Create optimistic message
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: Message = {
          id: tempId,
          content,
          senderId: user?.id || '',
          sessionId,
          type: messageType,
          status: 'SENT',
          createdAt: new Date(),
          sender: {
            id: user?.id || '',
            name: user?.name || '',
            picture: user?.picture || null,
          },
        };
        
        // Add optimistic message immediately
        setMessages((prev) => [...prev, optimisticMessage]);
        
        // Send via WebSocket
        emit('message:send', {
          content,
          sessionId,
          type: messageType,
        });
        
        // Return null - real message will come via message:sent event
        return null;
      } else {
        // Fallback to REST API
        try {
          const response = await messageApi.sendMessage({
            content,
            sessionId,
            type: messageType,
          });
          if (response.success && response.data) {
            const newMessage = {
              ...response.data,
              createdAt: new Date(response.data.createdAt),
              sender: response.data.sender,
            };
            setMessages((prev) => [...prev, newMessage]);
            return newMessage as Message;
          }
        return null;
      } catch (err) {
        return null;
      }
      }
    },
    [sessionId, isConnected, emit, user]
  );

  const markMessageAsRead = useCallback(async (messageId: string) => {
    if (!sessionId) return;

    try {
      // Use WebSocket if connected for real-time updates
      if (isConnected) {
        emit('message:read', { messageId });
      } else {
        await messageApi.markRead(messageId);
      }
      
      // Update local message status (optimistic update)
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              status: 'READ' as const,
              isRead: true,
              readAt: msg.readAt || new Date(),
            };
          }
          return msg;
        })
      );
    } catch (err) {
      // Silent error handling
    }
  }, [sessionId, isConnected, emit]);

  const markAllRead = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Use WebSocket if connected for real-time updates, otherwise fallback to REST
      if (isConnected) {
        emit('messages:markAllRead', { sessionId });
      } else {
        await messageApi.markAllRead(sessionId);
      }
      
      // Update local messages to reflect read status (optimistic update)
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          status: 'READ' as const,
          isRead: true,
          readAt: msg.readAt || new Date(),
        }))
      );
    } catch (err) {
      // Silent error handling
    }
  }, [sessionId, isConnected, emit]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore,
    sendMessage,
    markAllRead,
    markMessageAsRead,
    refresh: () => fetchMessages(true),
  };
}
