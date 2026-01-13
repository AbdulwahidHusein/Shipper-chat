/**
 * AI User Service
 * Manages the virtual AI user for AI chat sessions
 */

import prisma from '../config/database';

const AI_USER_ID = 'ai-assistant';
const AI_USER_EMAIL = 'ai@shipper.app';
const AI_USER_NAME = 'AI Assistant';
const AI_USER_GOOGLE_ID = 'ai-assistant-google-id';

export const getOrCreateAIUser = async () => {
  // Try to find existing AI user
  let aiUser = await prisma.user.findUnique({
    where: { id: AI_USER_ID },
  });

  // If not found, create it
  if (!aiUser) {
    aiUser = await prisma.user.create({
      data: {
        id: AI_USER_ID,
        email: AI_USER_EMAIL,
        name: AI_USER_NAME,
        googleId: AI_USER_GOOGLE_ID,
        isOnline: true, // AI is always "online"
        picture: null, // Can add AI avatar later
      },
    });
  }

  return aiUser;
};

export const getAIUserId = () => AI_USER_ID;
