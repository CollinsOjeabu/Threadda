import { internalQuery } from "./_generated/server"
import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"
import { countFittingSources, joinSources, wrapSource } from "./lib/untrusted"

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
 *
 * Also returns the ids that still resolve to the caller's own rows, so a
 * caller that persists sources (generation -> posts.create) can drop ones
 * deleted since the session was created instead of failing after the AI call.
 */
export const getSourceTexts = internalQuery({
  args: {
    sourceIds: v.array(v.id("contentItems")),
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const blocks: string[] = []
    const liveSourceIds: Id<"contentItems">[] = []

    // Set: rows written before dedupe-on-write may repeat an id.
    for (const id of new Set(args.sourceIds)) {
      const item = await ctx.db.get(id)
      if (!item) continue
      // Defence in depth behind the write-time assertOwnsSources checks.
      // Filters rather than throws: sources can legitimately be deleted, and
      // rows written before those checks existed may still hold foreign ids.
      if (item.userId !== args.profileId) continue
      liveSourceIds.push(id)

      // Scraped / uploaded text is untrusted: delimited and capped here, and
      // every prompt that embeds `context` also carries UNTRUSTED_SOURCES_RULE.
      blocks.push(
        wrapSource(item.rawText ?? "", {
          Title: item.title || "Untitled",
          Type: item.type,
          Summary: item.summary,
        }),
      )
    }

    // blocks and liveSourceIds are pushed in step, so the blocks that fit are
    // a prefix and their ids are the same-length prefix of liveSourceIds.
    const includedCount = countFittingSources(blocks)
    return {
      context: joinSources(blocks) || "No source content available.",
      // Every source that still exists (for the "all deleted" check).
      liveSourceIds,
      // Only the sources whose text actually reached the prompt.
      includedSourceIds: liveSourceIds.slice(0, includedCount),
    }
  },
})
