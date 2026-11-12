import { describe, expect, test } from "vitest"
import { MAX_CHAT_MESSAGE_CHARS, assertChatMessage } from "../convex/lib/chat"

describe("canvas chat message limit", () => {
  test("accepts messages up to the limit", () => {
    expect(assertChatMessage("hi")).toBe("hi")
    expect(() => assertChatMessage("a".repeat(MAX_CHAT_MESSAGE_CHARS))).not.toThrow()
  })

  test("rejects over-long and empty messages", () => {
    expect(() => assertChatMessage("a".repeat(MAX_CHAT_MESSAGE_CHARS + 1))).toThrow(/too long/)
    expect(() => assertChatMessage("   ")).toThrow(/empty/)
  })
})
