/**
 * useSessions Hook
 * Clean, professional session data management
 */

import { useState, useEffect, useCallback } from 'react';
import { sessionApi } from '@/lib/api-client';
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

  const createSession = useCallback(
    async (participant2Id: string): Promise<ChatSession | null> => {
      try {
        const response = await sessionApi.createSession({ participant2Id });
        if (response.success && response.data) {
          const newSession = {
            ...response.data,
            participant1: response.data.participant1,
            participant2: response.data.participant2,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
          };
          await fetchSessions();
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
