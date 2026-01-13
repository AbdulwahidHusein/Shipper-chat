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
    throw new Error('Gemini API key not configured');
  }

  try {
    // Get session to check if it's an AI session
    const session = await findSessionById(sessionId);
    if (!session || session.type !== 'AI') {
      throw new Error('Session is not an AI chat session');
    }

    // Get conversation history (last 10 messages for context)
    const messages = await findMessagesBySession(sessionId, 10);
    
    // Build conversation history for Gemini (format: array of {role, parts})
    const history = messages
      .filter((msg) => msg.content) // Filter out empty messages
      .map((msg) => ({
        role: msg.senderId === AI_USER_ID ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    // Initialize model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Start chat with history
    const chat = model.startChat({
      history: history,
    });

    // Send current message and get response
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('AI response generation error:', error);
    throw new Error('Failed to generate AI response');
  }
};
