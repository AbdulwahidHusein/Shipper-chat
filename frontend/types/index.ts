/**
 * Type definitions for the chat application
 */

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: User;
  sessionId: string;
  createdAt: Date;
  readAt?: Date;
  isRead?: boolean;
}

export interface ChatSession {
  id: string;
  participant1Id: string;
  participant2Id: string;
  participant1?: User;
  participant2?: User;
  lastMessage?: Message;
  unreadCount?: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
}
