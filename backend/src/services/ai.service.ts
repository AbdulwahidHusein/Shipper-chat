/**
 * AI Service
 * Google Gemini integration for AI chat
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { findMessagesBySession } from './message.service';
import { findSessionById } from './session.service';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const AI_USER_ID = 'ai-assistant'; // Virtual AI user ID

export const getAIUserId = () => AI_USER_ID;

export const generateAIResponse = async (
  sessionId: string,
  userMessage: string
): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY environment variable.');
  }

  try {
    const session = await findSessionById(sessionId);
    if (!session || session.type !== 'AI') {
      throw new Error('Session is not an AI chat session');
    }

    const messages = await findMessagesBySession(sessionId, 10);
    const chronologicalMessages = [...messages].reverse();
    
    const history = chronologicalMessages
      .filter((msg) => msg.content && msg.content.trim().length > 0)
      .map((msg) => ({
        role: msg.senderId === AI_USER_ID ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error('[AI] Error generating response:', error);
    throw error;
  }
};
