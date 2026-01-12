/**
 * Message Service
 * Clean, professional message management
 */

import prisma from '../config/database';
import { MessageType, MessageStatus } from '@prisma/client';
import { incrementUnreadCount, resetUnreadCount, updateLastMessage } from './session.service';

export interface CreateMessageData {
  content: string;
  senderId: string;
  sessionId: string;
  type?: MessageType;
}

export interface UpdateMessageData {
  content?: string;
  status?: MessageStatus;
}

export const findMessageById = async (id: string) => {
  return prisma.message.findUnique({
    where: { id },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
      session: {
        include: {
          participant1: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
          participant2: {
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

export const findMessagesBySession = async (
  sessionId: string,
  limit: number = 50,
  cursor?: string
) => {
  const where: any = {
    sessionId,
    deletedAt: null, // Only non-deleted messages
  };

  if (cursor) {
    where.id = {
      lt: cursor,
    };
  }

  return prisma.message.findMany({
    where,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
};

export const createMessage = async (data: CreateMessageData) => {
  // Create message
  const message = await prisma.message.create({
    data: {
      content: data.content,
      senderId: data.senderId,
      sessionId: data.sessionId,
      type: data.type || MessageType.TEXT,
      status: MessageStatus.SENT,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
  });

  // Update session's last message
  await updateLastMessage(data.sessionId, message.id);

  // Increment unread count for recipient
  await incrementUnreadCount(data.sessionId, data.senderId);

  return message;
};

export const updateMessage = async (
  id: string,
  data: UpdateMessageData,
  userId: string
) => {
  // Verify user is the sender
  const message = await findMessageById(id);
  if (!message) {
    throw new Error('Message not found');
  }

  if (message.senderId !== userId) {
    throw new Error('Unauthorized');
  }

  return prisma.message.update({
    where: { id },
    data: {
      ...data,
      editedAt: data.content ? new Date() : message.editedAt,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
  });
};

export const markMessageAsRead = async (id: string, userId: string) => {
  const message = await findMessageById(id);
  if (!message) {
    throw new Error('Message not found');
  }

  // Verify user is recipient (not sender)
  if (message.senderId === userId) {
    return message; // Sender can't mark their own message as read
  }

  // Verify user is participant in session
  const session = message.session;
  if (
    session.participant1Id !== userId &&
    session.participant2Id !== userId
  ) {
    throw new Error('Unauthorized');
  }

  // Update message status
  const updated = await prisma.message.update({
    where: { id },
    data: {
      status: MessageStatus.READ,
      readAt: new Date(),
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
  });

  return updated;
};

export const markMessagesAsRead = async (
  sessionId: string,
  userId: string
) => {
  // Verify user is participant
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.participant1Id !== userId && session.participant2Id !== userId) {
    throw new Error('Unauthorized');
  }

  // Get all messages that will be marked as read (before updating)
  const messagesToMark = await prisma.message.findMany({
    where: {
      sessionId,
      senderId: {
        not: userId, // Only messages from other participant
      },
      status: {
        not: MessageStatus.READ,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      senderId: true,
    },
  });

  // Mark all unread messages as read
  await prisma.message.updateMany({
    where: {
      sessionId,
      senderId: {
        not: userId, // Only messages from other participant
      },
      status: {
        not: MessageStatus.READ,
      },
      deletedAt: null,
    },
    data: {
      status: MessageStatus.READ,
      readAt: new Date(),
    },
  });

  // Reset unread count
  await resetUnreadCount(sessionId, userId);

  // Return messages that were marked as read (for WebSocket notifications)
  return messagesToMark;
};

export const markMessageAsDelivered = async (id: string) => {
  return prisma.message.update({
    where: { id },
    data: {
      status: MessageStatus.DELIVERED,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
  });
};

export const deleteMessage = async (id: string, userId: string) => {
  // Verify user is the sender
  const message = await findMessageById(id);
  if (!message) {
    throw new Error('Message not found');
  }

  if (message.senderId !== userId) {
    throw new Error('Unauthorized');
  }

  // Soft delete
  return prisma.message.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
  });
};

export const clearSessionMessages = async (
  sessionId: string,
  userId: string
) => {
  // Verify user is participant
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.participant1Id !== userId && session.participant2Id !== userId) {
    throw new Error('Unauthorized');
  }

  // Soft delete all messages
  await prisma.message.updateMany({
    where: {
      sessionId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};
