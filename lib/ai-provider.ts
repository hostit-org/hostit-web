import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Initialize Google AI provider with API key
export const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

// Export pre-configured models
export const gemini25Flash = googleAI('gemini-2.5-flash');
export const gemini15Flash = googleAI('gemini-1.5-flash');
export const gemini15Pro = googleAI('gemini-1.5-pro');