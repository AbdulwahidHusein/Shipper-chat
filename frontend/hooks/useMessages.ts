/**
 * useMessages Hook
 * Clean, professional message data management
 */

import { useState, useEffect, useCallback } from 'react';
import { messageApi } from '@/lib/api-client';
import type { Message } from '@/types';

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  sendMessage: (content: string) => Promise<Message | null>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMessages(sessionId: string | undefined): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

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

  useEffect(() => {
    setMessages([]);
    setCursor(undefined);
    setHasMore(true);
    fetchMessages(true);
  }, [sessionId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchMessages(false);
  }, [hasMore, loading, fetchMessages]);

  const sendMessage = useCallback(
    async (content: string): Promise<Message | null> => {
      if (!sessionId) return null;

      try {
        const response = await messageApi.sendMessage({
          content,
          sessionId,
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
        console.error('Send message error:', err);
        return null;
      }
    },
    [sessionId]
  );

  const markAllRead = useCallback(async () => {
    if (!sessionId) return;

    try {
      await messageApi.markAllRead(sessionId);
      // Update local messages to reflect read status
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          isRead: true,
          readAt: msg.readAt || new Date(),
        }))
      );
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  }, [sessionId]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore,
    sendMessage,
    markAllRead,
    refresh: () => fetchMessages(true),
  };
}
