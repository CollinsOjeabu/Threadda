import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // ─── User profile synced from Clerk ───
  profiles: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("team"), v.literal("internal")),
    onboardedAt: v.optional(v.number()),
    onboardingComplete: v.optional(v.boolean()),
    linkedInUrl: v.optional(v.string()),
    twitterHandle: v.optional(v.string()),
    voiceRawSamples: v.optional(v.array(v.string())),
    voiceProfile: v.optional(
      v.object({
        storytelling: v.optional(v.number()),
        technical: v.optional(v.number()),
        provocative: v.optional(v.number()),
        datadriven: v.optional(v.number()),
        formality: v.optional(v.number()),
        avgSentenceLength: v.optional(v.number()),
        usesQuestions: v.optional(v.boolean()),
        emojiUsage: v.optional(v.string()),
        signaturePhrases: v.optional(v.array(v.string())),
        writingPersona: v.optional(v.string()),
        trainedFrom: v.optional(v.string()),
        trainingPostCount: v.optional(v.number()),
        trainedAt: v.optional(v.number()),
      }),
    ),
    // ─── Rate-limit counters (Option A: optional, defaults handled in gate) ───
    generationsThisMonth: v.optional(v.number()),
    ingestionsThisMonth: v.optional(v.number()),
    canvasSessionsThisMonth: v.optional(v.number()),
    voiceDnaAnalysesThisMonth: v.optional(v.number()),
    periodResetAt: v.optional(v.number()),
    // ─── Theme preference (Sprint 3) ───
    theme: v.optional(v.union(v.literal("void"), v.literal("dark"), v.literal("light"))),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // ─── Saved research: articles, videos, notes, tweets ───
  contentItems: defineTable({
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
  })
    .index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "type"])
    .index("by_user_and_status", ["userId", "status"])
    .searchIndex("search_content", {
      searchField: "title",
      filterFields: ["userId", "type", "status"],
    }),

  // ─── Embedding vectors for content items (vector search) ───
  embeddings: defineTable({
    contentItemId: v.id("contentItems"),
    userId: v.id("profiles"),
    vector: v.array(v.float64()),
    createdAt: v.number(),
  })
    .vectorIndex("by_user", {
      vectorField: "vector",
      dimensions: 1536,
      filterFields: ["userId"],
    })
    .index("by_content_item", ["contentItemId"])
    .index("by_user_id", ["userId"]),

  // ─── Knowledge graph edges between content items ───
  // sourceA is always the lexicographically smaller _id of the pair
  graphEdges: defineTable({
    userId: v.id("profiles"),
    sourceA: v.id("contentItems"),
    sourceB: v.id("contentItems"),
    similarity: v.float64(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_pair", ["sourceA", "sourceB"])
    .index("by_source_a", ["sourceA"])
    .index("by_source_b", ["sourceB"]),

  // ─── Canvas: conversation workspace sessions ───
  canvasSessions: defineTable({
    userId: v.id("profiles"),
    name: v.string(),
    sourceIds: v.array(v.id("contentItems")),
    chatHistory: v.optional(v.array(v.object({
      role: v.union(v.literal("user"), v.literal("agent")),
      content: v.string(),
      timestamp: v.number(),
    }))),
    lastOpenedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ─── AI-generated posts from the Authority / Catalyst agents ───
  agentPosts: defineTable({
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
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_and_agent", ["userId", "agent"])
    .index("by_scheduled_at", ["scheduledAt"]),
})
