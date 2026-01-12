/**
 * WebSocket Authentication Middleware
 * JWT authentication for Socket.io connections
 */

import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { verifyToken } from '../services/auth.service';
import { findUserById } from '../services/user.service';
import { AuthenticatedSocket } from './socket.types';

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  try {
    // Try to get token from handshake auth (query param or header)
    let token: string | undefined;

    // Method 1: From query parameter (for WebSocket connections)
    if (socket.handshake.query?.token) {
      token = socket.handshake.query.token as string;
    }

    // Method 2: From Authorization header
    if (!token && socket.handshake.headers?.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // Method 3: From cookies (same as REST API) - PRIMARY METHOD
    if (!token && socket.handshake.headers?.cookie) {
      const cookies = socket.handshake.headers.cookie
        .split(';')
        .map((c) => c.trim());
      const tokenCookie = cookies.find((c) => c.startsWith('token='));
      if (tokenCookie) {
        token = tokenCookie.substring(6); // Remove 'token='
      }
    }

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user in database
    const user = await findUserById(decoded.userId);

    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach user to socket
    (socket as any).user = user;
    (socket as any).userId = user.id;

    next();
  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
};
