/**
 * Socket.io Server Setup
 * Clean, professional WebSocket server initialization
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './socket.types';
import { socketAuthMiddleware } from './socket.middleware';
import { setupSocketHandlers } from './socket.handlers';

let io: SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export const initializeSocket = (httpServer: HTTPServer, frontendUrl: string): SocketIOServer => {
  if (io) {
    return io;
  }

  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: frontendUrl,
      credentials: true, // This allows cookies to be sent
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'], // Support both WebSocket and polling
    cookie: {
      name: 'io',
      httpOnly: true,
      sameSite: 'lax',
    },
  });

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  // Setup event handlers
  setupSocketHandlers(io);

  return io;
};

export const getSocketIO = (): SocketIOServer | null => {
  return io;
};
