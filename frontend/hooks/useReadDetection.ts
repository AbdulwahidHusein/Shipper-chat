import { useEffect, useRef } from 'react';
import type { Message } from '@/types';

interface UseReadDetectionProps {
  messages: Message[];
  sessionId: string | undefined;
  currentUserId: string | undefined;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messageRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  markMessageAsRead: (messageId: string) => Promise<void>;
}

export function useReadDetection({
  messages,
  sessionId,
  currentUserId,
  messagesContainerRef,
  messageRefs,
  markMessageAsRead,
}: UseReadDetectionProps) {
  const readMessagesSet = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!sessionId || !currentUserId || !messagesContainerRef.current) return;

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
                message.senderId !== currentUserId &&
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
  }, [messages, sessionId, currentUserId, messagesContainerRef, messageRefs, markMessageAsRead]);

  // Reset read tracking when session changes
  useEffect(() => {
    if (sessionId) {
      readMessagesSet.current.clear();
    }
  }, [sessionId]);
}
