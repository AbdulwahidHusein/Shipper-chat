import { useState, useEffect, useRef } from 'react';
import { useSocket } from './useSocket';

interface UseTypingIndicatorReturn {
  typingUsers: Map<string, string>; // userId -> userName
  setTypingUsers: React.Dispatch<React.SetStateAction<Map<string, string>>>;
}

export function useTypingIndicator(
  sessionId: string | undefined,
  currentUserId: string | undefined
): UseTypingIndicatorReturn {
  const { isConnected, on } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const typingTimeoutsMap = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Listen for typing events
  useEffect(() => {
    if (!sessionId || !isConnected) return;

    const handleTypingStart = (data: any) => {
      if (data.sessionId === sessionId && data.userId !== currentUserId) {
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
      if (data.sessionId === sessionId && data.userId !== currentUserId) {
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
  }, [sessionId, isConnected, currentUserId, on]);

  return { typingUsers, setTypingUsers };
}
