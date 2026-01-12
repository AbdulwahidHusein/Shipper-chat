/**
 * useUsers Hook
 * Clean, professional user list management
 */

import { useState, useEffect, useCallback } from 'react';
import { userApi } from '@/lib/api-client';
import type { User } from '@/types';

interface UseUsersReturn {
  users: User[];
  onlineUsers: User[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [allUsersResponse, onlineUsersResponse] = await Promise.all([
        userApi.getAllUsers(),
        userApi.getOnlineUsers(),
      ]);

      if (allUsersResponse.success && allUsersResponse.data) {
        const transformedUsers = (allUsersResponse.data as any[]).map((user) => ({
          ...user,
          lastSeen: user.lastSeen ? new Date(user.lastSeen) : undefined,
        }));
        setUsers(transformedUsers);
      }

      if (onlineUsersResponse.success && onlineUsersResponse.data) {
        const transformedOnline = (onlineUsersResponse.data as any[]).map((user) => ({
          ...user,
          lastSeen: user.lastSeen ? new Date(user.lastSeen) : undefined,
        }));
        setOnlineUsers(transformedOnline);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    onlineUsers,
    loading,
    error,
    refresh: fetchUsers,
  };
}
