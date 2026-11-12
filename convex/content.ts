import { query, mutation } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"
import { ConvexError } from "convex/values"

/**
 * List content items for a user, optionally filtered by type.
 */
export const list = query({
  args: {
    type: v.optional(
      v.union(
        v.literal("article"),
        v.literal("video"),
        v.literal("note"),
        v.literal("tweet"),
        v.literal("pdf"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("contentItems"),
      _creationTime: v.number(),
      userId: v.id("profiles"),
      type: v.union(
        v.literal("article"),
        v.literal("video"),
        v.literal("note"),
        v.literal("tweet"),
        v.literal("pdf"),
      ),
      title: v.string(),
      url: v.optional(v.string()),
      rawText: v.optional(v.string()),
      summary: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      embeddingId: v.optional(v.string()),
      status: v.union(
        v.literal("queued"),
        v.literal("processing"),
        v.literal("ready"),
        v.literal("error"),
      ),
      errorMessage: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) return []

    const limit = args.limit ?? 50

    if (args.type) {
      return await ctx.db
        .query("contentItems")
        .withIndex("by_user_and_type", (q) =>
          q.eq("userId", profile._id).eq("type", args.type!),
        )
        .order("desc")
        .take(limit)
    }

    return await ctx.db
      .query("contentItems")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .order("desc")
      .take(limit)
  },
})

/**
 * Get a single content item by ID.
 */
export const get = query({
  args: { id: v.id("contentItems") },
  returns: v.union(
    v.object({
      _id: v.id("contentItems"),
      _creationTime: v.number(),
      userId: v.id("profiles"),
      type: v.union(
        v.literal("article"),
        v.literal("video"),
        v.literal("note"),
        v.literal("tweet"),
        v.literal("pdf"),
      ),
      title: v.string(),
      url: v.optional(v.string()),
      rawText: v.optional(v.string()),
      summary: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      embeddingId: v.optional(v.string()),
      status: v.union(
        v.literal("queued"),
        v.literal("processing"),
        v.literal("ready"),
        v.literal("error"),
      ),
      errorMessage: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) return null

    const item = await ctx.db.get(args.id)
    // Return null (not a throw) on mismatch: a distinguishable error would be
    // an existence oracle, revealing that an id exists but belongs elsewhere.
    if (!item || item.userId !== profile._id) return null

    return item
  },
})

/**
 * Create a new content item (manual note, or queued URL for scraping).
 */
export const create = mutation({
  args: {
    userId: v.id("profiles"),
    type: v.union(
      v.literal("article"),
      v.literal("video"),
      v.literal("note"),
      v.literal("tweet"),
      v.literal("pdf"),
    ),
    title: v.string(),
    url: v.optional(v.string()),
    rawText: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("contentItems"),
  handler: async (ctx, args) => {
    // Verify auth + ownership of the userId
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) throw new ConvexError("Profile not found")

    if (args.userId !== profile._id) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Not authorized to create content for this user" })
    }

    if (args.title.trim().length === 0) {
      throw new ConvexError({ code: "VALIDATION", message: "Title is required" })
    }

    const isNote = args.type === "note"
    return await ctx.db.insert("contentItems", {
      userId: args.userId,
      type: args.type,
      title: args.title.trim(),
      url: args.url,
      rawText: args.rawText,
      tags: args.tags,
      status: isNote ? "ready" : "queued",
    })
  },
})

/**
 * Delete a content item by its ID.
 */
export const remove = mutation({
  args: { contentId: v.id("contentItems") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 1. Get authenticated profile
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) throw new ConvexError("Profile not found")

    // 2. Verify ownership
    const content = await ctx.db.get(args.contentId)
    if (!content) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Content item not found" })
    }
    if (content.userId !== profile._id) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Not authorized to delete this content" })
    }

    // 3. Clean up graph edges referencing this content item
    await ctx.scheduler.runAfter(0, internal.graphEdges.deleteEdgesForSource, {
      sourceId: args.contentId,
    })

    // 4. Clean up the embedding row for this content item
    await ctx.scheduler.runAfter(0, internal.embeddings.deleteEmbeddingForContentItem, {
      contentItemId: args.contentId,
    })

    // 5. Delete the content item
    await ctx.db.delete(args.contentId)
    return null
  },
})

/**
 * Update a content item with partial fields.
 */
export const update = mutation({
  args: {
    id: v.id("contentItems"),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    // Only user-editable fields. status, rawText, embeddingId and
    // errorMessage belong to the ingestion pipeline and are written only by
    // internal functions (internal.helpers.*), so a client can't mark a
    // failed item ready or swap the text its embedding was built from.
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) throw new ConvexError("Profile not found")

    const item = await ctx.db.get(args.id)
    if (!item || item.userId !== profile._id) throw new ConvexError("Item not found")

    const { id, ...updates } = args
    // Filter out undefined values
    const patch: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patch[key] = value
    }

    await ctx.db.patch(id, patch)
    return await ctx.db.get(id)
  },
})

/**
 * Create a content item using Clerk auth (no userId arg needed).
 * Used by onboarding and other auth-gated flows.
 */
export const createFromAuth = mutation({
  args: {
    title: v.string(),
    url: v.optional(v.string()),
    content: v.optional(v.string()),
    type: v.union(
      v.literal("article"),
      v.literal("video"),
      v.literal("note"),
      v.literal("tweet"),
      v.literal("pdf"),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) throw new ConvexError("Profile not found")

    if (args.title.trim().length === 0) {
      throw new ConvexError("Title is required")
    }

    const isNote = args.type === "note"
    return await ctx.db.insert("contentItems", {
      userId: profile._id,
      type: args.type,
      title: args.title.trim(),
      url: args.url,
      rawText: args.content,
      status: isNote ? "ready" : "queued",
    })
  },
})

