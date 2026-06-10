import { GoogleGenAI } from "@google/genai";

/** Shared Gemini client — reads GEMINI_API_KEY. */
export const ai = new GoogleGenAI({});

/**
 * Free-tier strategy: gemini-3.5-flash only allows ~20 requests/day free,
 * so we stay on the 2.5 family which has far higher free limits.
 * Check yours at https://aistudio.google.com/rate-limit
 */

/** Conversation + content generation (chat, stories, vocab sets). */
export const CHAT_MODEL = "gemini-2.5-flash";

/** High-frequency lightweight calls (corrections, word definitions). */
export const LITE_MODEL = "gemini-2.5-flash-lite";
