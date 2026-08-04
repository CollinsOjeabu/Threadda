import { internalQuery } from "./_generated/server"
import { v } from "convex/values"

/**
 * Internal query: fetch last N content items for a user.
 */
export const _getUserContent = internalQuery({
  args: { userId: v.id("profiles"), limit: v.number() },
  handler: async (ctx, { userId, limit }) => {
    return ctx.db
      .query("contentItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit)
  },
})

// NOTE: The getForUser action was moved to ideasActions.ts
// to support "use node" directive required by @anthropic-ai/sdk 0.104.0.
// Client code should use api.ideasActions.getForUser instead of api.ideas.getForUser.
