import { internalQuery } from "./_generated/server"
import { v } from "convex/values"

/**
 * Get session data for the chat action (internal only).
 */
export const getSessionForChat = internalQuery({
  args: {
    sessionId: v.id("canvasSessions"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique()
    if (!profile) return null

    const session = await ctx.db.get(args.sessionId)
    if (!session || session.userId !== profile._id) return null

    return session
  },
})

/**
 * Get source content text for Claude context (internal only).
 */
export const getSourceTexts = internalQuery({
  args: {
    sourceIds: v.array(v.id("contentItems")),
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const parts: string[] = []

    for (const id of args.sourceIds) {
      const item = await ctx.db.get(id)
      if (!item) continue
      // Defence in depth behind the write-time assertOwnsSources checks.
      // Filters rather than throws: sources can legitimately be deleted, and
      // rows written before those checks existed may still hold foreign ids.
      if (item.userId !== args.profileId) continue

      const title = item.title || "Untitled"
      const summary = item.summary || ""
      const text = item.rawText?.slice(0, 3000) || ""

      parts.push(
        `---\n**Source: ${title}** (${item.type})\n${summary ? `Summary: ${summary}\n\n` : ""}${text}\n---`
      )
    }

    return parts.join("\n\n") || "No source content available."
  },
})
