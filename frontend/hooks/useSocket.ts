/**
 * useSocket Hook
 * React hook for WebSocket connection management
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { socketClient, SocketStatus } from '@/lib/socket-client';
import { useAuth } from '@/contexts/AuthContext';

interface UseSocketReturn {
  status: SocketStatus;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: Function) => () => void;
  off: (event: string, callback: Function) => void;
}

export function useSocket(): UseSocketReturn {
  const [status, setStatus] = useState<SocketStatus>(socketClient.getStatus());
  const [isConnected, setIsConnected] = useState(socketClient.isConnected());
  const { user, loading: authLoading } = useAuth();

  // Track mounted state
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Only connect if user is authenticated and not loading
    if (!authLoading && user) {
      socketClient.connect();
    }

    // Listen for status changes
    const unsubscribeStatus = socketClient.on('status:change', (newStatus: SocketStatus) => {
      if (isMountedRef.current) {
        setStatus(newStatus);
        setIsConnected(newStatus === 'connected');
      }
    });

    // Update initial state
    setStatus(socketClient.getStatus());
    setIsConnected(socketClient.isConnected());

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      unsubscribeStatus();
    };
  }, [user, authLoading]);

  const emit = useCallback((event: string, data?: any) => {
    socketClient.emit(event, data);
  }, []);

  const on = useCallback(
    (event: string, callback: Function) => {
      return socketClient.on(event, callback);
    },
    []
  );

  const off = useCallback((event: string, callback: Function) => {
    socketClient.off(event, callback);
  }, []);

  return {
    status,
    isConnected,
    emit,
    on,
    off,
  };
}
