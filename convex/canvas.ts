import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { ConvexError } from "convex/values"
import { gateMutation } from "./lib/rateLimit"
import { assertOwnsSources } from "./lib/ownership"

/**
 * Create a new canvas session with selected sources.
 */
export const createSession = mutation({
  args: {
    name: v.string(),
    sourceIds: v.array(v.id("contentItems")),
  },
  returns: v.id("canvasSessions"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) throw new ConvexError("Profile not found")

    // Every attached source must belong to the caller. Checked before the
    // rate-limit gate so a rejected request does not consume quota.
    await assertOwnsSources(ctx, profile._id, args.sourceIds)

    // Rate-limit check: canvasSessions
    await gateMutation(ctx, profile._id, "canvasSessions")

    return await ctx.db.insert("canvasSessions", {
      userId: profile._id,
      name: args.name.trim() || "Untitled Session",
      sourceIds: args.sourceIds,
      chatHistory: [],
      lastOpenedAt: Date.now(),
    })
  },
})

/**
 * Get a single canvas session by ID.
 */
export const getSession = query({
  args: { sessionId: v.id("canvasSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) return null

    const session = await ctx.db.get(args.sessionId)
    if (!session || session.userId !== profile._id) return null

    return session
  },
})

/**
 * List all canvas sessions for the current user, ordered by most recent.
 */
export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) return []

    const sessions = await ctx.db
      .query("canvasSessions")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect()

    // Sort by lastOpenedAt descending (most recent first)
    return sessions.sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)
  },
})

/**
 * Delete a canvas session.
 */
export const deleteSession = mutation({
  args: { sessionId: v.id("canvasSessions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) throw new ConvexError("Profile not found")

    const session = await ctx.db.get(args.sessionId)
    if (!session || session.userId !== profile._id)
      throw new ConvexError("Session not found")

    await ctx.db.delete(args.sessionId)
    return null
  },
})
