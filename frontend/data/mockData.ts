/**
 * Mock data for development
 * Matches the data structure shown in Figma
 */

import { User, ChatSession, Message } from '@/types';

// Mock Users (from Figma)
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Fego Chidera',
    email: 'fego@example.com',
    picture: 'https://i.pravatar.cc/150?img=1',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Yomi Immanuel',
    email: 'yomi@example.com',
    picture: 'https://i.pravatar.cc/150?img=2',
    isOnline: true,
  },
  {
    id: '3',
    name: 'Bianca Nubia',
    email: 'bianca@example.com',
    picture: 'https://i.pravatar.cc/150?img=3',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Zender Lowre',
    email: 'zender@example.com',
    picture: 'https://i.pravatar.cc/150?img=4',
    isOnline: false,
  },
  {
    id: '5',
    name: 'Palmer Dian',
    email: 'palmer@example.com',
    picture: 'https://i.pravatar.cc/150?img=5',
    isOnline: false,
  },
  {
    id: '6',
    name: 'Yuki Tanaka',
    email: 'yuki@example.com',
    picture: 'https://i.pravatar.cc/150?img=6',
    isOnline: false,
  },
  {
    id: '7',
    name: 'Daniel CH',
    email: 'daniel@example.com',
    picture: 'https://i.pravatar.cc/150?img=7',
    isOnline: true,
  },
  {
    id: '8',
    name: 'John Doe',
    email: 'john@example.com',
    picture: 'https://i.pravatar.cc/150?img=8',
    isOnline: true,
  },
  {
    id: '9',
    name: 'Adrian Kurt',
    email: 'adrian@example.com',
    picture: 'https://i.pravatar.cc/150?img=9',
    isOnline: true,
  },
  {
    id: '10',
    name: 'Bianca Lofre',
    email: 'bianca.lofre@example.com',
    picture: 'https://i.pravatar.cc/150?img=10',
    isOnline: true,
  },
  {
    id: '11',
    name: 'Diana Sayu',
    email: 'diana@example.com',
    picture: 'https://i.pravatar.cc/150?img=11',
    isOnline: false,
  },
  {
    id: '12',
    name: 'Sam Kohler',
    email: 'sam@example.com',
    picture: 'https://i.pravatar.cc/150?img=12',
    isOnline: true,
  },
];

// Current user (for mock)
export const currentUser: User = mockUsers[7]; // John Doe

// Mock Messages (matching Figma conversation with Daniel CH)
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const mockMessages: Message[] = [
  // Messages from "Jonjon" (current user) to Daniel CH
  {
    id: 'm1',
    content: "Hey, Jonjon",
    senderId: currentUser.id,
    sessionId: 'session1',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 17 * 60 * 1000), // 10:17 AM
    isRead: true,
  },
  {
    id: 'm2',
    content: "Can you help with with the last task for Eventora, please?",
    senderId: currentUser.id,
    sessionId: 'session1',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 17 * 60 * 1000 + 1000),
    isRead: true,
  },
  {
    id: 'm3',
    content: "I'm little bit confused with the task.. 😕",
    senderId: currentUser.id,
    sessionId: 'session1',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 17 * 60 * 1000 + 2000),
    isRead: true,
  },
  // Response from Daniel CH
  {
    id: 'm4',
    content: "it's done already, no worries!",
    senderId: '7', // Daniel CH
    sessionId: 'session1',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 22 * 60 * 1000), // 10:22 AM
    isRead: true,
  },
  // More from current user
  {
    id: 'm5',
    content: "what...",
    senderId: currentUser.id,
    sessionId: 'session1',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 32 * 60 * 1000), // 10:32 AM
    isRead: true,
  },
  {
    id: 'm6',
    content: "Really?! Thank you so much! 😍",
    senderId: currentUser.id,
    sessionId: 'session1',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 32 * 60 * 1000 + 1000),
    isRead: true,
  },
  // Final response from Daniel CH
  {
    id: 'm7',
    content: "anytime! my pleasure~",
    senderId: '7', // Daniel CH
    sessionId: 'session1',
    createdAt: new Date(today.getTime() + 11 * 60 * 60 * 1000 + 1 * 60 * 1000), // 11:01 AM
    isRead: true,
  },
];

// Mock Chat Sessions (matching Figma message list)
export const mockSessions: ChatSession[] = [
  {
    id: 'session1',
    participant1Id: currentUser.id,
    participant2Id: '7', // Daniel CH
    participant2: mockUsers[6],
    lastMessage: {
      id: 'm7',
      content: "anytime! my pleasure~",
      senderId: '7',
      sessionId: 'session1',
      createdAt: new Date(today.getTime() + 11 * 60 * 60 * 1000 + 1 * 60 * 1000),
      isRead: true,
    },
    unreadCount: 0,
    updatedAt: new Date(today.getTime() + 11 * 60 * 60 * 1000 + 1 * 60 * 1000),
    createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'session2',
    participant1Id: currentUser.id,
    participant2Id: '1', // Fego Chidera
    participant2: mockUsers[0],
    lastMessage: {
      id: 'lm2',
      content: "Thanks for the explanation!",
      senderId: '1',
      sessionId: 'session2',
      createdAt: new Date(now.getTime() - 3 * 60 * 1000), // 3 mins ago
      isRead: false,
    },
    unreadCount: 1,
    updatedAt: new Date(now.getTime() - 3 * 60 * 1000),
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'session3',
    participant1Id: currentUser.id,
    participant2Id: '2', // Yomi Immanuel
    participant2: mockUsers[1],
    lastMessage: {
      id: 'lm3',
      content: "Let's do a quick call after lunch, I'll explain the brief later on",
      senderId: '2',
      sessionId: 'session3',
      createdAt: new Date(now.getTime() - 12 * 60 * 1000), // 12 mins ago
      isRead: false,
    },
    unreadCount: 1,
    updatedAt: new Date(now.getTime() - 12 * 60 * 1000),
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'session4',
    participant1Id: currentUser.id,
    participant2Id: '3', // Bianca Nubia
    participant2: mockUsers[2],
    lastMessage: {
      id: 'lm4',
      content: "anytime! my pleasure~",
      senderId: '3',
      sessionId: 'session4',
      createdAt: new Date(now.getTime() - 32 * 60 * 1000), // 32 mins ago
      isRead: false,
    },
    unreadCount: 1,
    updatedAt: new Date(now.getTime() - 32 * 60 * 1000),
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'session5',
    participant1Id: currentUser.id,
    participant2Id: '4', // Zender Lowre
    participant2: mockUsers[3],
    lastMessage: {
      id: 'lm5',
      content: "Okay cool, that make sense 👍",
      senderId: '4',
      sessionId: 'session5',
      createdAt: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
      isRead: false,
    },
    unreadCount: 1,
    updatedAt: new Date(now.getTime() - 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'session6',
    participant1Id: currentUser.id,
    participant2Id: '5', // Palmer Dian
    participant2: mockUsers[4],
    lastMessage: {
      id: 'lm6',
      content: "Thanks, Jonas! That helps 😄",
      senderId: '5',
      sessionId: 'session6',
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
      isRead: true,
    },
    unreadCount: 0,
    updatedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'session7',
    participant1Id: currentUser.id,
    participant2Id: '6', // Yuki Tanaka
    participant2: mockUsers[5],
    lastMessage: {
      id: 'lm7',
      content: "Have you watch the new season of Danmachi?! That was so good!",
      senderId: '6',
      sessionId: 'session7',
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
      isRead: false,
    },
    unreadCount: 1,
    updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
  },
];

// Helper function to get messages for a session
export function getMessagesForSession(sessionId: string): Message[] {
  if (sessionId === 'session1') {
    return mockMessages;
  }
  // Return empty array for other sessions (can be expanded later)
  return [];
}

// Helper function to get other participant in a session
export function getOtherParticipant(session: ChatSession, currentUserId: string): User | undefined {
  if (session.participant1Id === currentUserId) {
    return session.participant2;
  }
  return session.participant1;
}
