/**
 * useSessions Hook
 * Clean, professional session data management with WebSocket support
 */

import { useState, useEffect, useCallback } from 'react';
import { sessionApi } from '@/lib/api-client';
import { useSocket } from './useSocket';
import type { ChatSession } from '@/types';

interface UseSessionsReturn {
  sessions: ChatSession[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createSession: (participant2Id: string) => Promise<ChatSession | null>;
  archiveSession: (sessionId: string) => Promise<void>;
  unarchiveSession: (sessionId: string) => Promise<void>;
  muteSession: (sessionId: string) => Promise<void>;
  unmuteSession: (sessionId: string) => Promise<void>;
  markUnread: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

export function useSessions(includeArchived: boolean = false): UseSessionsReturn {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, on } = useSocket();

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sessionApi.getSessions(includeArchived);
      if (response.success && response.data) {
        // Transform API response to match frontend types
        const transformedSessions = (response.data as any[]).map((session) => ({
          ...session,
          participant1: session.participant1,
          participant2: session.participant2,
          lastMessage: session.lastMessage
            ? {
                ...session.lastMessage,
                createdAt: new Date(session.lastMessage.createdAt),
                readAt: session.lastMessage.readAt
                  ? new Date(session.lastMessage.readAt)
                  : undefined,
                type: session.lastMessage.type || 'TEXT',
                status: session.lastMessage.status || 'SENT',
                isRead: session.lastMessage.status === 'READ',
              }
            : undefined,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
        }));
        setSessions(transformedSessions);
      } else {
        setError(response.error?.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [includeArchived]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // WebSocket event listeners for session updates
  useEffect(() => {
    if (!isConnected) return;

    // Listen for session updates
    const handleSessionUpdate = (data: any) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === data.id
            ? {
                ...session,
                lastMessageId: data.lastMessageId,
                unreadCount: data.unreadCount,
                updatedAt: new Date(data.updatedAt),
              }
            : session
        )
      );
    };

    // Listen for new sessions
    const handleSessionNew = (data: any) => {
      const newSession: ChatSession = {
        id: data.id,
        participant1Id: data.participant1Id,
        participant2Id: data.participant2Id,
        type: data.type,
        isArchived: false,
        isMuted: false,
        unreadCount: 0,
        lastMessageId: null,
        participant1: data.participant1,
        participant2: data.participant2,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.createdAt),
      };
      setSessions((prev) => {
        // Avoid duplicates
        if (prev.some((s) => s.id === newSession.id)) {
          return prev;
        }
        return [...prev, newSession];
      });
    };

    // Listen for message status updates to update lastMessage read status
    const handleMessageStatus = (data: any) => {
      setSessions((prev) =>
        prev.map((session) => {
          // If the updated message is the last message, update its status
          if (session.lastMessage?.id === data.messageId) {
            return {
              ...session,
              lastMessage: {
                ...session.lastMessage,
                status: data.status,
                readAt: data.readAt ? new Date(data.readAt) : session.lastMessage.readAt,
                isRead: data.status === 'READ',
              },
            };
          }
          return session;
        })
      );
    };

    // Listen for presence updates to update session participants' online status
    const handlePresenceUpdate = (data: any) => {
      setSessions((prev) =>
        prev.map((session) => {
          // Update participant1 online status
          if (session.participant1?.id === data.userId) {
            return {
              ...session,
              participant1: {
                ...session.participant1,
                isOnline: data.isOnline,
                lastSeen: new Date(data.lastSeen),
              },
            };
          }
          // Update participant2 online status
          if (session.participant2?.id === data.userId) {
            return {
              ...session,
              participant2: {
                ...session.participant2,
                isOnline: data.isOnline,
                lastSeen: new Date(data.lastSeen),
              },
            };
          }
          return session;
        })
      );
    };

    const unsubscribeUpdate = on('session:update', handleSessionUpdate);
    const unsubscribeNew = on('session:new', handleSessionNew);
    const unsubscribeMessageStatus = on('message:status', handleMessageStatus);
    const unsubscribePresence = on('presence:update', handlePresenceUpdate);

    return () => {
      unsubscribeUpdate();
      unsubscribeNew();
      unsubscribeMessageStatus();
      unsubscribePresence();
    };
  }, [isConnected, on]);

  const createSession = useCallback(
    async (participant2Id: string): Promise<ChatSession | null> => {
      try {
        const response = await sessionApi.createSession({ participant2Id });
        if (response.success && response.data) {
          const newSession = {
            ...response.data,
            participant1: response.data.participant1,
            participant2: response.data.participant2,
            lastMessage: response.data.lastMessage
              ? {
                  ...response.data.lastMessage,
                  createdAt: new Date(response.data.lastMessage.createdAt),
                  readAt: response.data.lastMessage.readAt
                    ? new Date(response.data.lastMessage.readAt)
                    : undefined,
                  type: response.data.lastMessage.type || 'TEXT',
                  status: response.data.lastMessage.status || 'SENT',
                  isRead: response.data.lastMessage.status === 'READ',
                }
              : undefined,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
            isArchived: false, // Ensure it's not archived after unarchiving
          };
          
          // Add session to local state immediately (optimistic update)
          setSessions((prev) => {
            // Avoid duplicates
            if (prev.some((s) => s.id === newSession.id)) {
              return prev.map((s) => (s.id === newSession.id ? newSession : s));
            }
            return [newSession, ...prev];
          });
          
          // Refresh sessions in background to ensure consistency
          fetchSessions().catch(() => {
            // Ignore errors - we already have the session in state
          });
          
          return newSession as ChatSession;
        }
        return null;
      } catch (err) {
        console.error('Create session error:', err);
        return null;
      }
    },
    [fetchSessions]
  );

  const archiveSession = useCallback(
    async (sessionId: string) => {
      try {
        await sessionApi.archiveSession(sessionId);
        await fetchSessions();
      } catch (err) {
        console.error('Archive session error:', err);
      }
    },
    [fetchSessions]
  );

  const unarchiveSession = useCallback(
    async (sessionId: string) => {
      try {
        await sessionApi.unarchiveSession(sessionId);
        await fetchSessions();
      } catch (err) {
        console.error('Unarchive session error:', err);
      }
    },
    [fetchSessions]
  );

  const muteSession = useCallback(
    async (sessionId: string) => {
      try {
        await sessionApi.muteSession(sessionId);
        await fetchSessions();
      } catch (err) {
        console.error('Mute session error:', err);
      }
    },
    [fetchSessions]
  );

  const unmuteSession = useCallback(
    async (sessionId: string) => {
      try {
        await sessionApi.unmuteSession(sessionId);
        await fetchSessions();
      } catch (err) {
        console.error('Unmute session error:', err);
      }
    },
    [fetchSessions]
  );

  const markUnread = useCallback(
    async (sessionId: string) => {
      try {
        await sessionApi.markUnread(sessionId);
        await fetchSessions();
      } catch (err) {
        console.error('Mark unread error:', err);
      }
    },
    [fetchSessions]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await sessionApi.deleteSession(sessionId);
        await fetchSessions();
      } catch (err) {
        console.error('Delete session error:', err);
      }
    },
    [fetchSessions]
  );

  return {
    sessions,
    loading,
    error,
    refresh: fetchSessions,
    createSession,
    archiveSession,
    unarchiveSession,
    muteSession,
    unmuteSession,
    markUnread,
    deleteSession,
  };
}
