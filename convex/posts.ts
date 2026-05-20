import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { ConvexError } from "convex/values"

/* ── Shared return shape ── */
const postShape = v.object({
  _id: v.id("agentPosts"),
  _creationTime: v.number(),
  userId: v.id("profiles"),
  agent: v.union(v.literal("authority"), v.literal("catalyst")),
  platform: v.union(v.literal("linkedin"), v.literal("x")),
  title: v.optional(v.string()),
  body: v.string(),
  sourceContentIds: v.array(v.id("contentItems")),
  status: v.union(
    v.literal("draft"),
    v.literal("review"),
    v.literal("approved"),
    v.literal("scheduled"),
    v.literal("published"),
    v.literal("rejected"),
  ),
  scheduledAt: v.optional(v.number()),
  publishedAt: v.optional(v.number()),
  publishedUrl: v.optional(v.string()),
  feedback: v.optional(v.string()),
  voiceMatchScore: v.optional(v.number()),
})

/**
 * List agent-generated posts for a user, filtered by status.
 */
export const list = query({
  args: {
    userId: v.id("profiles"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("review"),
        v.literal("approved"),
        v.literal("scheduled"),
        v.literal("published"),
        v.literal("rejected"),
      ),
    ),
  },
  returns: v.array(postShape),
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("agentPosts")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", args.userId).eq("status", args.status!),
        )
        .order("desc")
        .collect()
    }

    return await ctx.db
      .query("agentPosts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect()
  },
})

/**
 * Get scheduled posts for the current user, ordered by scheduledAt ascending.
 */
export const getScheduled = query({
  args: {},
  returns: v.array(postShape),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) return []

    const posts = await ctx.db
      .query("agentPosts")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", profile._id).eq("status", "scheduled"),
      )
      .collect()

    // Sort by scheduledAt ascending (soonest first)
    return posts.sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0))
  },
})

/**
 * Approve or reject a post from the review queue.
 */
export const updateStatus = mutation({
  args: {
    postId: v.id("agentPosts"),
    status: v.union(
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("scheduled"),
      v.literal("draft"),
    ),
    feedback: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) throw new ConvexError("Profile not found")

    const post = await ctx.db.get(args.postId)
    if (!post) throw new ConvexError({ code: "NOT_FOUND", message: "Post not found" })
    if (post.userId !== profile._id) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Not authorized to update this post" })
    }

    await ctx.db.patch(args.postId, {
      status: args.status,
      feedback: args.feedback,
    })
    return null
  },
})

/**
 * Schedule an approved post for publishing at a specific time.
 */
export const schedule = mutation({
  args: {
    postId: v.id("agentPosts"),
    scheduledAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error("Post not found")

    // Verify ownership
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile || post.userId !== profile._id) {
      throw new Error("Not authorized")
    }

    await ctx.db.patch(args.postId, {
      status: "scheduled",
      scheduledAt: args.scheduledAt,
    })
    return null
  },
})

/**
 * Delete a post.
 */
export const remove = mutation({
  args: { postId: v.id("agentPosts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) throw new ConvexError("Profile not found")

    const post = await ctx.db.get(args.postId)
    if (!post) throw new ConvexError({ code: "NOT_FOUND", message: "Post not found" })
    if (post.userId !== profile._id) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Not authorized to delete this post" })
    }

    await ctx.db.delete(args.postId)
    return null
  },
})

/**
 * Create a new agent post (draft).
 * Called by the generation action or directly from the UI.
 */
export const create = mutation({
  args: {
    agent: v.union(v.literal("authority"), v.literal("catalyst")),
    platform: v.union(v.literal("linkedin"), v.literal("x")),
    body: v.string(),
    sourceContentIds: v.array(v.id("contentItems")),
    title: v.optional(v.string()),
    voiceMatchScore: v.optional(v.number()),
  },
  returns: v.id("agentPosts"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!profile) throw new Error("Profile not found")

    return await ctx.db.insert("agentPosts", {
      userId: profile._id,
      agent: args.agent,
      platform: args.platform,
      body: args.body,
      sourceContentIds: args.sourceContentIds,
      status: "draft",
      title: args.title,
      voiceMatchScore: args.voiceMatchScore,
    })
  },
})

/**
 * Update a post's body text (inline editing from Agents page).
 */
export const update = mutation({
  args: {
    postId: v.id("agentPosts"),
    body: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error("Post not found")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile || post.userId !== profile._id) {
      throw new Error("Not authorized")
    }

    await ctx.db.patch(args.postId, { body: args.body })
    return null
  },
})

/**
 * Unschedule a post: set status back to draft and clear scheduledAt.
 */
export const unschedule = mutation({
  args: { postId: v.id("agentPosts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) throw new ConvexError("Profile not found")

    const post = await ctx.db.get(args.postId)
    if (!post) throw new ConvexError({ code: "NOT_FOUND", message: "Post not found" })
    if (post.userId !== profile._id) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Not authorized" })
    }

    await ctx.db.patch(args.postId, {
      status: "draft",
      scheduledAt: undefined,
    })
    return null
  },
})
