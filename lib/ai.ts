import { GoogleGenAI } from "@google/genai";

/** Shared Gemini client — reads GEMINI_API_KEY. */
export const ai = new GoogleGenAI({});

/**
 * Free-tier quotas are PER MODEL per day (gemini-2.5-flash is currently
 * 20 requests/day free — same as 3.5). Spreading calls across flash and
 * flash-lite doubles the daily budget.
 * Check yours at https://aistudio.google.com/rate-limit
 */

/** Conversation + content generation (chat, stories, vocab sets). */
export const CHAT_MODEL = "gemini-2.5-flash";

/** High-frequency lightweight calls (corrections, word definitions). */
export const LITE_MODEL = "gemini-3.1-flash-lite";
