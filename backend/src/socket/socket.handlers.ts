/**
 * WebSocket Event Handlers
 * Clean, professional event handling for real-time chat
 */

import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  AuthenticatedSocket,
} from './socket.types';
import { createMessage, markMessageAsDelivered, markMessageAsRead } from '../services/message.service';
import { findSessionById } from '../services/session.service';
import { updateOnlineStatus } from '../services/user.service';

type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type SocketInstance = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * Get room name for a session
 */
const getSessionRoom = (sessionId: string): string => {
  return `session:${sessionId}`;
};

/**
 * Get room name for user presence
 */
const getUserRoom = (userId: string): string => {
  return `user:${userId}`;
};

/**
 * Setup socket event handlers
 */
export const setupSocketHandlers = (io: SocketServer) => {
  io.on('connection', (socket: SocketInstance) => {
    const authSocket = socket as unknown as AuthenticatedSocket;
    const user = (socket as any).user;
    const userId = (socket as any).userId;

    if (!user || !userId) {
      socket.disconnect();
      return;
    }

    console.log(`✅ User connected: ${user.name} (${userId})`);

    // Join user's presence room
    socket.join(getUserRoom(userId));

    // Set user online status
    updateOnlineStatus(userId, true)
      .then(() => {
        // Broadcast online status to relevant users
        io.emit('presence:update', {
          userId,
          isOnline: true,
          lastSeen: new Date().toISOString(),
        });
      })
      .catch((err) => {
        // Silent error handling
      });

    // Send connection success
    socket.emit('connection:success');

    // ============================================
    // MESSAGE EVENTS
    // ============================================

    /**
     * Handle message sending
     */
    socket.on('message:send', async (data) => {
      try {
        // Verify user is participant in session
        const session = await findSessionById(data.sessionId);
        if (!session) {
          socket.emit('connection:error', { message: 'Session not found' });
          return;
        }

        if (session.participant1Id !== userId && session.participant2Id !== userId) {
          socket.emit('connection:error', { message: 'Unauthorized' });
          return;
        }

        // Create message in database
        const message = await createMessage({
          content: data.content,
          senderId: userId,
          sessionId: data.sessionId,
          type: data.type as any,
        });

        // Determine recipient
        const recipientId =
          session.participant1Id === userId
            ? session.participant2Id
            : session.participant1Id;

        // Emit to sender (confirmation)
        socket.emit('message:sent', {
          id: message.id,
          content: message.content,
          sessionId: message.sessionId,
          type: message.type,
          createdAt: message.createdAt.toISOString(),
        });

        // Fetch updated session to get latest unreadCount and lastMessageId
        const updatedSession = await findSessionById(data.sessionId);

        // Emit to recipient ONLY (not to sender - sender already has optimistic update)
        const recipientRoom = getUserRoom(recipientId);
        io.to(recipientRoom).emit('message:new', {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          sessionId: message.sessionId,
          type: message.type,
          status: message.status,
          createdAt: message.createdAt.toISOString(),
          sender: {
            id: user.id,
            name: user.name,
            picture: user.picture,
          },
        });

        // Emit session update to both participants
        if (updatedSession) {
          io.to(getUserRoom(userId)).emit('session:update', {
            id: updatedSession.id,
            lastMessageId: updatedSession.lastMessageId,
            unreadCount: updatedSession.unreadCount,
            updatedAt: updatedSession.updatedAt.toISOString(),
          });

          io.to(getUserRoom(recipientId)).emit('session:update', {
            id: updatedSession.id,
            lastMessageId: updatedSession.lastMessageId,
            unreadCount: updatedSession.unreadCount,
            updatedAt: updatedSession.updatedAt.toISOString(),
          });
        }
      } catch (error) {
        console.error('Error handling message:send:', error);
        socket.emit('connection:error', {
          message: 'Failed to send message',
        });
      }
    });

    /**
     * Handle message delivered status
     */
    socket.on('message:delivered', async (data) => {
      try {
        await markMessageAsDelivered(data.messageId);

        // Find message sender to notify them
        const { findMessageById } = await import('../services/message.service');
        const message = await findMessageById(data.messageId);

        if (message && message.senderId !== userId) {
          // Notify sender that message was delivered
          io.to(getUserRoom(message.senderId)).emit('message:status', {
            messageId: data.messageId,
            status: 'DELIVERED',
          });
        }
      } catch (error) {
        // Silent error handling
      }
    });

    /**
     * Handle message read status
     */
    socket.on('message:read', async (data) => {
      try {
        const message = await markMessageAsRead(data.messageId, userId);

        // Notify sender that their message was read (sender is always different from reader)
        // markMessageAsRead already validates that senderId !== userId
        io.to(getUserRoom(message.senderId)).emit('message:status', {
          messageId: data.messageId,
          status: 'READ',
          readAt: message.readAt?.toISOString(),
        });
      } catch (error) {
        // Silent error handling
      }
    });

    /**
     * Handle mark all messages as read (via WebSocket for real-time)
     */
    socket.on('messages:markAllRead', async (data) => {
      try {
        const { markMessagesAsRead } = await import('../services/message.service');
        const messagesMarked = await markMessagesAsRead(data.sessionId, userId);

        // Emit real-time events to notify senders
        if (messagesMarked.length > 0) {
          const readAt = new Date().toISOString();
          messagesMarked.forEach((message) => {
            // Notify the sender that their message was read
            io.to(getUserRoom(message.senderId)).emit('message:status', {
              messageId: message.id,
              status: 'READ',
              readAt,
            });
          });
        }
      } catch (error) {
        // Silent error handling
      }
    });

    // ============================================
    // PRESENCE EVENTS
    // ============================================

    /**
     * Handle explicit online status
     */
    socket.on('presence:online', async () => {
      try {
        await updateOnlineStatus(userId, true);
        io.emit('presence:update', {
          userId,
          isOnline: true,
          lastSeen: new Date().toISOString(),
        });
      } catch (error) {
        // Silent error handling
      }
    });

    /**
     * Handle explicit offline status
     */
    socket.on('presence:offline', async () => {
      try {
        await updateOnlineStatus(userId, false);
        io.emit('presence:update', {
          userId,
          isOnline: false,
          lastSeen: new Date().toISOString(),
        });
      } catch (error) {
        // Silent error handling
      }
    });

    // ============================================
    // DISCONNECTION
    // ============================================

    socket.on('disconnect', async () => {

      // Set user offline with a delay (to handle reconnections)
      setTimeout(async () => {
        // Check if user is still disconnected
        const sockets = await io.in(getUserRoom(userId)).fetchSockets();
        if (sockets.length === 0) {
          await updateOnlineStatus(userId, false);
          io.emit('presence:update', {
            userId,
            isOnline: false,
            lastSeen: new Date().toISOString(),
          });
        }
      }, 5000); // 5 second delay
    });
  });
};
