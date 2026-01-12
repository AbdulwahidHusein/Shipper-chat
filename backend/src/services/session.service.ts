/**
 * Session Service
 * Clean, professional session management
 */

import prisma from '../config/database';
import { SessionType } from '@prisma/client';

export interface CreateSessionData {
  participant1Id: string;
  participant2Id: string;
  type?: SessionType;
}

export interface UpdateSessionData {
  isArchived?: boolean;
  isMuted?: boolean;
}

export const findSessionById = async (id: string) => {
  return prisma.chatSession.findUnique({
    where: { id },
    include: {
      participant1: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      participant2: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      lastMessage: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
        },
      },
    },
  });
};

export const findSessionByParticipants = async (
  participant1Id: string,
  participant2Id: string
) => {
  return prisma.chatSession.findFirst({
    where: {
      OR: [
        {
          participant1Id,
          participant2Id,
        },
        {
          participant1Id: participant2Id,
          participant2Id: participant1Id,
        },
      ],
    },
    include: {
      participant1: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      participant2: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      lastMessage: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
        },
      },
    },
  });
};

export const findUserSessions = async (
  userId: string,
  includeArchived: boolean = false
) => {
  return prisma.chatSession.findMany({
    where: {
      OR: [
        { participant1Id: userId },
        { participant2Id: userId },
      ],
      ...(includeArchived ? {} : { isArchived: false }),
    },
    include: {
      participant1: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      participant2: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      lastMessage: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
};

export const createSession = async (data: CreateSessionData) => {
  // Check if session already exists
  const existing = await findSessionByParticipants(
    data.participant1Id,
    data.participant2Id
  );

  if (existing) {
    return existing;
  }

  return prisma.chatSession.create({
    data: {
      participant1Id: data.participant1Id,
      participant2Id: data.participant2Id,
      type: data.type || SessionType.DIRECT,
    },
    include: {
      participant1: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      participant2: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          isOnline: true,
          lastSeen: true,
        },
      },
    },
  });
};

export const updateSession = async (
  id: string,
  data: UpdateSessionData
) => {
  return prisma.chatSession.update({
    where: { id },
    data,
    include: {
      participant1: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      participant2: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      lastMessage: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
        },
      },
    },
  });
};

export const archiveSession = async (id: string, userId: string) => {
  // Verify user is participant
  const session = await findSessionById(id);
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.participant1Id !== userId && session.participant2Id !== userId) {
    throw new Error('Unauthorized');
  }

  return updateSession(id, { isArchived: true });
};

export const unarchiveSession = async (id: string, userId: string) => {
  // Verify user is participant
  const session = await findSessionById(id);
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.participant1Id !== userId && session.participant2Id !== userId) {
    throw new Error('Unauthorized');
  }

  return updateSession(id, { isArchived: false });
};

export const muteSession = async (id: string, userId: string) => {
  // Verify user is participant
  const session = await findSessionById(id);
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.participant1Id !== userId && session.participant2Id !== userId) {
    throw new Error('Unauthorized');
  }

  return updateSession(id, { isMuted: true });
};

export const unmuteSession = async (id: string, userId: string) => {
  // Verify user is participant
  const session = await findSessionById(id);
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.participant1Id !== userId && session.participant2Id !== userId) {
    throw new Error('Unauthorized');
  }

  return updateSession(id, { isMuted: false });
};

export const markSessionAsUnread = async (id: string, userId: string) => {
  // Verify user is participant
  const session = await findSessionById(id);
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.participant1Id !== userId && session.participant2Id !== userId) {
    throw new Error('Unauthorized');
  }

  // Increment unread count
  return prisma.chatSession.update({
    where: { id },
    data: {
      unreadCount: {
        increment: 1,
      },
    },
    include: {
      participant1: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      participant2: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      lastMessage: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
        },
      },
    },
  });
};

export const incrementUnreadCount = async (sessionId: string, userId: string) => {
  const session = await findSessionById(sessionId);
  if (!session) return;

  // Only increment if user is not the sender
  const recipientId =
    session.participant1Id === userId
      ? session.participant2Id
      : session.participant1Id;

  await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      unreadCount: {
        increment: 1,
      },
    },
  });
};

export const resetUnreadCount = async (sessionId: string, userId: string) => {
  const session = await findSessionById(sessionId);
  if (!session) return;

  // Verify user is participant
  if (session.participant1Id !== userId && session.participant2Id !== userId) {
    return;
  }

  await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      unreadCount: 0,
    },
  });
};

export const updateLastMessage = async (
  sessionId: string,
  messageId: string
) => {
  return prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      lastMessageId: messageId,
      updatedAt: new Date(),
    },
  });
};

export const deleteSession = async (id: string, userId: string) => {
  // Verify user is participant
  const session = await findSessionById(id);
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.participant1Id !== userId && session.participant2Id !== userId) {
    throw new Error('Unauthorized');
  }

  return prisma.chatSession.delete({
    where: { id },
  });
};
