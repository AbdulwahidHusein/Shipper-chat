/**
 * WebSocket Event Types
 * Type-safe event definitions for Socket.io
 */

import { User } from '@prisma/client';

// Extended Socket interface with user
export interface AuthenticatedSocket {
  id: string;
  userId: string;
  user: User;
  emit: (event: string, ...args: any[]) => void;
  join: (room: string) => void;
  leave: (room: string) => void;
  disconnect: () => void;
}

// Client → Server Events
export interface ClientToServerEvents {
  // Message events
  'message:send': (data: {
    content: string;
    sessionId: string;
    type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'LINK';
  }) => void;

  'message:delivered': (data: { messageId: string }) => void;
  'message:read': (data: { messageId: string }) => void;
  'messages:markAllRead': (data: { sessionId: string }) => void;

  // Presence events
  'presence:online': () => void;
  'presence:offline': () => void;

  // Typing events (optional)
  'typing:start': (data: { sessionId: string }) => void;
  'typing:stop': (data: { sessionId: string }) => void;
}

// Server → Client Events
export interface ServerToClientEvents {
  // Message events
  'message:new': (data: {
    id: string;
    content: string;
    senderId: string;
    sessionId: string;
    type: string;
    status: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
      picture: string | null;
    };
  }) => void;

  'message:sent': (data: {
    id: string;
    content: string;
    sessionId: string;
    type: string;
    createdAt: string;
  }) => void;

  'message:status': (data: {
    messageId: string;
    status: 'DELIVERED' | 'READ';
    readAt?: string;
  }) => void;

  // Session events
  'session:update': (data: {
    id: string;
    lastMessageId: string | null;
    unreadCount: number;
    updatedAt: string;
  }) => void;

  'session:new': (data: {
    id: string;
    participant1Id: string;
    participant2Id: string;
    type: string;
    createdAt: string;
    participant1: {
      id: string;
      name: string;
      picture: string | null;
    };
    participant2: {
      id: string;
      name: string;
      picture: string | null;
    };
  }) => void;

  // Presence events
  'presence:update': (data: {
    userId: string;
    isOnline: boolean;
    lastSeen: string;
  }) => void;

  // Connection events
  'connection:error': (data: { message: string }) => void;
  'connection:success': () => void;
}

// Inter-server events (for future Redis adapter)
export interface InterServerEvents {
  ping: () => void;
}

// Socket data (attached to socket)
export interface SocketData {
  user: User;
  userId: string;
}
