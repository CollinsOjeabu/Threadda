import { query, internalMutation } from "./_generated/server"
import { v } from "convex/values"
import { normalizeOrderedPair } from "./lib/similarity"
import type { Id } from "./_generated/dataModel"

/**
 * Return the total number of graph edges for the authenticated user.
 * Lightweight query — used by the dashboard stat card.
 */
export const getCountForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return 0

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()
    if (!profile) return 0

    const edges = await ctx.db
      .query("graphEdges")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect()
    return edges.length
  },
})

/**
 * Upsert a graph edge between two content items.
 * Idempotent: uses canonical (sourceA, sourceB) ordering so (A,B) and (B,A)
 * resolve to the same row. If the edge exists, it is updated with the new
 * similarity score; otherwise a new edge is inserted.
 *
 * @internal — only called from graphCompute actions, never from the frontend.
 */
export const upsertEdge = internalMutation({
  args: {
    userId: v.id("profiles"),
    sourceIdA: v.id("contentItems"),
    sourceIdB: v.id("contentItems"),
    similarity: v.float64(),
  },
  handler: async (ctx, args) => {
    // 1. Reject self-edges
    if (args.sourceIdA === args.sourceIdB) {
      return null
    }

    // 2. Reject similarity below threshold (defensive — callers should filter)
    if (args.similarity < 0.7) {
      return null
    }

    // 3. Normalize pair ordering
    const { sourceA: sourceAStr, sourceB: sourceBStr } = normalizeOrderedPair(
      args.sourceIdA,
      args.sourceIdB
    )
    const sourceA = sourceAStr as Id<"contentItems">
    const sourceB = sourceBStr as Id<"contentItems">

    // 4. Check for existing edge using by_pair index
    const existing = await ctx.db
      .query("graphEdges")
      .withIndex("by_pair", (q) => q.eq("sourceA", sourceA).eq("sourceB", sourceB))
      .unique()

    if (existing) {
      // 5a. Update existing edge
      await ctx.db.patch(existing._id, {
        similarity: args.similarity,
        createdAt: Date.now(),
      })
      return existing._id
    }

    // 5b. Insert new edge
    return await ctx.db.insert("graphEdges", {
      userId: args.userId,
      sourceA,
      sourceB,
      similarity: args.similarity,
      createdAt: Date.now(),
    })
  },
})

/**
 * List all graph edges for the authenticated user's library.
 * Public query — used by the Constellation UI (Sprint 3+).
 */
export const listEdgesForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!profile) return []

    const edges = await ctx.db
      .query("graphEdges")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect()

    return edges.map((e) => ({
      _id: e._id,
      sourceA: e.sourceA,
      sourceB: e.sourceB,
      similarity: e.similarity,
      createdAt: e.createdAt,
    }))
  },
})

/**
 * Delete all graph edges that reference a given content item.
 * Called when a content item is deleted from the library.
 *
 * @internal — called from content.remove via scheduler.
 */
export const deleteEdgesForSource = internalMutation({
  args: { sourceId: v.id("contentItems") },
  handler: async (ctx, args) => {
    let deleted = 0

    // Delete edges where sourceId is sourceA
    const edgesA = await ctx.db
      .query("graphEdges")
      .withIndex("by_source_a", (q) => q.eq("sourceA", args.sourceId))
      .collect()

    for (const edge of edgesA) {
      await ctx.db.delete(edge._id)
      deleted++
    }

    // Delete edges where sourceId is sourceB
    const edgesB = await ctx.db
      .query("graphEdges")
      .withIndex("by_source_b", (q) => q.eq("sourceB", args.sourceId))
      .collect()

    for (const edge of edgesB) {
      await ctx.db.delete(edge._id)
      deleted++
    }

    console.log(`[deleteEdgesForSource] Deleted ${deleted} edges for content item ${args.sourceId}`)
    return { deleted }
  },
})
