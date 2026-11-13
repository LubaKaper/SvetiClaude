/**
 * Vercel serverless function: /api/chat
 * Keeps the AI key on the server and streams the tutor's reply.
 * Set OPENAI_API_KEY (and optionally OPENAI_MODEL) in the Vercel project.
 */
import { handleChat } from '../server/chat.js'

export const config = { maxDuration: 60 }

export default function handler(req, res) {
  return handleChat(req, res, req.body)
}
