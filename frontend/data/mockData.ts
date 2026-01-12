/**
 * Mock data for development
 * Matches the data structure shown in Figma
 */

import { User, ChatSession, Message, SharedMedia, SharedLink, SharedDocument } from '@/types';

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

// Mock Shared Media (for Daniel CH - session1)
export const mockSharedMedia: SharedMedia[] = [
  // May (7 images)
  {
    id: 'media1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
    createdAt: new Date(2024, 4, 28), // May
    sessionId: 'session1',
  },
  {
    id: 'media2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200',
    createdAt: new Date(2024, 4, 27),
    sessionId: 'session1',
  },
  {
    id: 'media3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=200',
    createdAt: new Date(2024, 4, 26),
    sessionId: 'session1',
  },
  {
    id: 'media4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200',
    createdAt: new Date(2024, 4, 25),
    sessionId: 'session1',
  },
  {
    id: 'media5',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1557672199-6ab42ab48320?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557672199-6ab42ab48320?w=200',
    createdAt: new Date(2024, 4, 24),
    sessionId: 'session1',
  },
  {
    id: 'media6',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=200',
    createdAt: new Date(2024, 4, 23),
    sessionId: 'session1',
  },
  {
    id: 'media7',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
    createdAt: new Date(2024, 4, 22),
    sessionId: 'session1',
  },
  // April (5 images)
  {
    id: 'media8',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1616161560417-66d4db5892ec?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616161560417-66d4db5892ec?w=200',
    createdAt: new Date(2024, 3, 28),
    sessionId: 'session1',
  },
  {
    id: 'media9',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200',
    createdAt: new Date(2024, 3, 27),
    sessionId: 'session1',
  },
  {
    id: 'media10',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=200',
    createdAt: new Date(2024, 3, 26),
    sessionId: 'session1',
  },
  {
    id: 'media11',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200',
    createdAt: new Date(2024, 3, 25),
    sessionId: 'session1',
  },
  {
    id: 'media12',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1611173504750-7f36b9c06d5a?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611173504750-7f36b9c06d5a?w=200',
    createdAt: new Date(2024, 3, 24),
    sessionId: 'session1',
  },
  // March (8 images)
  {
    id: 'media13',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200',
    createdAt: new Date(2024, 2, 30),
    sessionId: 'session1',
  },
  {
    id: 'media14',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1561212044-bac5ef688a07?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1561212044-bac5ef688a07?w=200',
    createdAt: new Date(2024, 2, 29),
    sessionId: 'session1',
  },
  {
    id: 'media15',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200',
    createdAt: new Date(2024, 2, 28),
    sessionId: 'session1',
  },
  {
    id: 'media16',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
    createdAt: new Date(2024, 2, 27),
    sessionId: 'session1',
  },
  {
    id: 'media17',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=200',
    createdAt: new Date(2024, 2, 26),
    sessionId: 'session1',
  },
  {
    id: 'media18',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=200',
    createdAt: new Date(2024, 2, 25),
    sessionId: 'session1',
  },
  {
    id: 'media19',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1620121478247-ec786b9be2fa?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620121478247-ec786b9be2fa?w=200',
    createdAt: new Date(2024, 2, 24),
    sessionId: 'session1',
  },
  {
    id: 'media20',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200',
    createdAt: new Date(2024, 2, 23),
    sessionId: 'session1',
  },
];

// Helper function to get shared media for a session
export function getSharedMediaForSession(sessionId: string): SharedMedia[] {
  return mockSharedMedia.filter((media) => media.sessionId === sessionId);
}

// Helper function to group media by month
export function groupMediaByMonth(media: SharedMedia[]): { month: string; items: SharedMedia[] }[] {
  const grouped = media.reduce((acc, item) => {
    const monthKey = item.createdAt.toLocaleString('default', { month: 'long' });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(item);
    return acc;
  }, {} as Record<string, SharedMedia[]>);

  // Sort by most recent first
  return Object.entries(grouped)
    .map(([month, items]) => ({ month, items }))
    .sort((a, b) => b.items[0].createdAt.getTime() - a.items[0].createdAt.getTime());
}

// Mock Shared Links (for session1)
export const mockSharedLinks: SharedLink[] = [
  {
    id: 'link1',
    url: 'https://basecamp.net/',
    title: 'Basecamp',
    description: 'Discover thousands of premium UI kits, templates, and design resources tailored for designers, developers, and...',
    favicon: 'https://logo.clearbit.com/basecamp.com',
    createdAt: new Date(2024, 4, 15),
    sessionId: 'session1',
  },
  {
    id: 'link2',
    url: 'https://notion.com/',
    title: 'Notion',
    description: "A new tool that blends your everyday work apps into one. It's the all-in-one workspace for you and your team.",
    favicon: 'https://logo.clearbit.com/notion.so',
    createdAt: new Date(2024, 4, 10),
    sessionId: 'session1',
  },
  {
    id: 'link3',
    url: 'https://asana.com/',
    title: 'Asana',
    description: 'Work anytime, anywhere with Asana. Keep remote and distributed teams, and your entire organization, focused...',
    favicon: 'https://logo.clearbit.com/asana.com',
    createdAt: new Date(2024, 4, 8),
    sessionId: 'session1',
  },
  {
    id: 'link4',
    url: 'https://trello.com/',
    title: 'Trello',
    description: 'Make the impossible, possible with Trello. The ultimate teamwork project management tool. Start up board in se...',
    favicon: 'https://logo.clearbit.com/trello.com',
    createdAt: new Date(2024, 4, 5),
    sessionId: 'session1',
  },
];

// Mock Shared Documents (for session1)
export const mockSharedDocuments: SharedDocument[] = [
  {
    id: 'doc1',
    name: 'Document Requirement.pdf',
    type: 'pdf',
    size: 16 * 1024 * 1024, // 16 MB
    pages: 10,
    createdAt: new Date(2024, 4, 20),
    sessionId: 'session1',
  },
  {
    id: 'doc2',
    name: 'User Flow.pdf',
    type: 'pdf',
    size: 32 * 1024 * 1024, // 32 MB
    pages: 7,
    createdAt: new Date(2024, 4, 18),
    sessionId: 'session1',
  },
  {
    id: 'doc3',
    name: 'Existing App.fig',
    type: 'fig',
    size: 213 * 1024 * 1024, // 213 MB
    createdAt: new Date(2024, 4, 15),
    sessionId: 'session1',
  },
  {
    id: 'doc4',
    name: 'Product Illustrations.ai',
    type: 'ai',
    size: 72 * 1024 * 1024, // 72 MB
    createdAt: new Date(2024, 4, 12),
    sessionId: 'session1',
  },
  {
    id: 'doc5',
    name: 'Quotation-Hikariworks-May.pdf',
    type: 'pdf',
    size: 329 * 1024, // 329 KB
    pages: 2,
    createdAt: new Date(2024, 4, 10),
    sessionId: 'session1',
  },
];

// Helper function to get shared links for a session
export function getSharedLinksForSession(sessionId: string): SharedLink[] {
  return mockSharedLinks.filter((link) => link.sessionId === sessionId);
}

// Helper function to get shared documents for a session
export function getSharedDocumentsForSession(sessionId: string): SharedDocument[] {
  return mockSharedDocuments.filter((doc) => doc.sessionId === sessionId);
}

// Helper function to group links by month
export function groupLinksByMonth(links: SharedLink[]): { month: string; items: SharedLink[] }[] {
  const grouped = links.reduce((acc, item) => {
    const monthKey = item.createdAt.toLocaleString('default', { month: 'long' });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(item);
    return acc;
  }, {} as Record<string, SharedLink[]>);

  return Object.entries(grouped)
    .map(([month, items]) => ({ month, items }))
    .sort((a, b) => b.items[0].createdAt.getTime() - a.items[0].createdAt.getTime());
}

// Helper function to group documents by month
export function groupDocumentsByMonth(documents: SharedDocument[]): { month: string; items: SharedDocument[] }[] {
  const grouped = documents.reduce((acc, item) => {
    const monthKey = item.createdAt.toLocaleString('default', { month: 'long' });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(item);
    return acc;
  }, {} as Record<string, SharedDocument[]>);

  return Object.entries(grouped)
    .map(([month, items]) => ({ month, items }))
    .sort((a, b) => b.items[0].createdAt.getTime() - a.items[0].createdAt.getTime());
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(0) + ' MB';
}
