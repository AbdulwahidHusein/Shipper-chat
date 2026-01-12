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
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'LINK';
  status?: 'SENT' | 'DELIVERED' | 'READ';
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
  isArchived?: boolean;
  isMuted?: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface SharedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  createdAt: Date;
  sessionId: string;
}

export interface SharedLink {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon: string;
  createdAt: Date;
  sessionId: string;
}

export interface SharedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'fig' | 'ai' | 'psd' | 'xd' | 'sketch';
  size: number; // in bytes
  pages?: number;
  createdAt: Date;
  sessionId: string;
}
