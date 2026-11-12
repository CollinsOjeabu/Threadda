import { ConvexError } from "convex/values"

/** Longest canvas chat message accepted from a client. */
// 8,000 rather than 4,000: the canvas refine flow sends the whole current
// post (LinkedIn allows 3,000 chars) plus the instruction as one message.
export const MAX_CHAT_MESSAGE_CHARS = 8000

/**
 * Convex's v.string() has no length bound, so this runs first in the
 * handler: before any read, quota charge or Claude call.
 */
export function assertChatMessage(message: string): string {
  const trimmed = message.trim()
  if (trimmed.length === 0) throw new ConvexError("Message is empty.")
  if (message.length > MAX_CHAT_MESSAGE_CHARS) {
    throw new ConvexError(`Message is too long (max ${MAX_CHAT_MESSAGE_CHARS} characters).`)
  }
  return message
}
