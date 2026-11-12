import { internalMutation, internalQuery } from "./_generated/server"
import { v, ConvexError } from "convex/values"

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

export const IDEAS_PER_HOUR = 20
const ONE_HOUR_MS = 60 * 60 * 1000

/**
 * Internal mutation: charge one ideas request to the caller's rolling hourly
 * window, or throw if the window is full. Ideas are not a billable feature,
 * so this is a cost guard rather than a plan limit: 20/hour covers normal
 * dashboard visits but stops a client from calling Claude in a loop.
 */
export const _claimIdeasRequest = internalMutation({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, { profileId }) => {
    const profile = await ctx.db.get(profileId)
    if (!profile) throw new ConvexError("Profile not found")
    if (profile.plan === "internal") return

    const now = Date.now()
    const windowStart = profile.ideasWindowStart ?? 0
    const count = profile.ideasWindowCount ?? 0

    if (now - windowStart >= ONE_HOUR_MS) {
      await ctx.db.patch(profileId, { ideasWindowStart: now, ideasWindowCount: 1 })
      return
    }
    if (count >= IDEAS_PER_HOUR) {
      throw new ConvexError({
        code: "IDEAS_RATE_LIMITED",
        message: "Too many idea requests. Try again later.",
        resetAt: windowStart + ONE_HOUR_MS,
      })
    }
    await ctx.db.patch(profileId, { ideasWindowCount: count + 1 })
  },
})
