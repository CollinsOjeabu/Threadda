import { internalMutation, internalQuery, query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Internal mutation to save a scraped + processed content item.
 * Called from the ingestion action.
 */
export const saveContentItem = internalMutation({
  args: {
    userId: v.id("profiles"),
    url: v.string(),
    title: v.string(),
    rawText: v.string(),
    summary: v.string(),
    embeddingId: v.string(),
  },
  returns: v.id("contentItems"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("contentItems", {
      userId: args.userId,
      type: "article",
      title: args.title,
      url: args.url,
      rawText: args.rawText,
      summary: args.summary || undefined,
      embeddingId: args.embeddingId || undefined,
      status: "ready",
    })
  },
})

/**
 * Internal mutation to insert a content item from the raw text pipeline.
 * Unlike saveContentItem, url and embeddingId are optional —
 * uploaded files don't have a URL, and embedding may fail gracefully.
 *
 * @internal — called from ingestion.processRawText
 */
export const insertContentItem = internalMutation({
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
    rawText: v.string(),
    summary: v.optional(v.string()),
    embeddingId: v.optional(v.string()),
  },
  returns: v.id("contentItems"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("contentItems", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      rawText: args.rawText,
      summary: args.summary || undefined,
      embeddingId: args.embeddingId || undefined,
      status: "ready",
    })
  },
})

/**
 * Internal query to get item status (for ingestion polling).
 */
export const getItemStatus = internalQuery({
  args: { itemId: v.id("contentItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId)
    if (!item) return null
    return { status: item.status, errorMessage: item.errorMessage }
  },
})

/**
 * Internal query to get profile by Clerk ID.
 * Used by voiceDna and ingestion actions.
 */
export const getProfileByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique()
  },
})

/**
 * Internal mutation to save voice profile JSON string.
 */
export const saveVoiceProfile = internalMutation({
  args: {
    clerkId: v.string(),
    voiceProfile: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique()

    if (!profile) return null

    // Parse the JSON string into the typed voiceProfile object
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(args.voiceProfile)
    } catch {
      return null
    }

    await ctx.db.patch(profile._id, {
      voiceProfile: {
        storytelling: typeof parsed.storytelling === "number" ? parsed.storytelling : undefined,
        technical: typeof parsed.technical === "number" ? parsed.technical : undefined,
        provocative: typeof parsed.provocative === "number" ? parsed.provocative : undefined,
        datadriven: typeof parsed.datadriven === "number" ? parsed.datadriven : undefined,
        formality: typeof parsed.formality === "number" ? parsed.formality : undefined,
        avgSentenceLength: typeof parsed.avgSentenceLength === "number" ? parsed.avgSentenceLength : undefined,
        usesQuestions: typeof parsed.usesQuestions === "boolean" ? parsed.usesQuestions : undefined,
        emojiUsage: typeof parsed.emojiUsage === "string" ? parsed.emojiUsage : undefined,
        signaturePhrases: Array.isArray(parsed.signaturePhrases) ? parsed.signaturePhrases as string[] : undefined,
        writingPersona: typeof parsed.writingPersona === "string" ? parsed.writingPersona : undefined,
        trainedFrom: typeof parsed.trainedFrom === "string" ? parsed.trainedFrom : undefined,
        trainingPostCount: typeof parsed.trainingPostCount === "number" ? parsed.trainingPostCount : undefined,
        trainedAt: typeof parsed.trainedAt === "number" ? parsed.trainedAt : undefined,
      },
    })
    return null
  },
})

/**
 * Internal mutation to append chat messages to a canvas session.
 */
export const appendCanvasMessages = internalMutation({
  args: {
    sessionId: v.id("canvasSessions"),
    userMessage: v.string(),
    agentResponse: v.string(),
    timestamp: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session) return null

    const history = session.chatHistory ?? []
    history.push(
      { role: "user", content: args.userMessage, timestamp: args.timestamp },
      { role: "agent", content: args.agentResponse, timestamp: args.timestamp + 1 },
    )

    await ctx.db.patch(args.sessionId, {
      chatHistory: history,
      lastOpenedAt: Date.now(),
    })
    return null
  },
})

/**
 * Get the current user's voice profile (parsed from JSON).
 * Public query — used by the Settings page.
 */
export const getVoiceProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!profile?.voiceProfile) return null

    return profile.voiceProfile
  },
})
