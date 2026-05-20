import { query, mutation, internalMutation } from "./_generated/server"
import { v } from "convex/values"
import { ConvexError } from "convex/values"

/**
 * Get the current user's profile by their Clerk ID.
 * Called on every authenticated page load.
 */
export const getByClerkId = query({
  args: { clerkId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
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
      generationsThisMonth: v.optional(v.number()),
      ingestionsThisMonth: v.optional(v.number()),
      canvasSessionsThisMonth: v.optional(v.number()),
      voiceDnaAnalysesThisMonth: v.optional(v.number()),
      periodResetAt: v.optional(v.number()),
      theme: v.optional(v.union(v.literal("void"), v.literal("dark"), v.literal("light"))),
      preferences: v.optional(v.object({
        auto: v.optional(v.boolean()),
        daily: v.optional(v.boolean()),
        weekly: v.optional(v.boolean()),
        discovery: v.optional(v.boolean()),
      })),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique()
  },
})

/**
 * Get the current authenticated user's profile.
 * Uses Clerk auth identity — no args needed.
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    return await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
  },
})

/**
 * Ensure a profile exists for the current Clerk user.
 * Called client-side by the useCurrentUser hook on first dashboard visit.
 * Idempotent — does nothing if profile already exists.
 */
export const ensureProfile = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique()

    if (existing) {
      return existing._id
    }

    return await ctx.db.insert("profiles", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      plan: "free",
    })
  },
})

/**
 * Mark onboarding as complete for the current user.
 */
export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!profile) throw new ConvexError("Profile not found")

    await ctx.db.patch(profile._id, {
      onboardingComplete: true,
      onboardedAt: Date.now(),
    })

    return { success: true }
  },
})

/**
 * Save raw writing samples for voice training (Phase E analyses them).
 */
export const saveVoiceSamples = mutation({
  args: { samples: v.array(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    if (args.samples.length === 0)
      throw new ConvexError("At least one writing sample is required")
    if (args.samples.length > 5)
      throw new ConvexError("Maximum 5 writing samples allowed")

    const cleaned = args.samples.map((s) => s.trim()).filter((s) => s.length > 0)
    if (cleaned.length === 0)
      throw new ConvexError("Samples cannot be empty")

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!profile) throw new ConvexError("Profile not found")

    await ctx.db.patch(profile._id, {
      voiceRawSamples: cleaned,
    })

    return { saved: true, count: cleaned.length }
  },
})

/**
 * Upsert profile from Clerk webhook (user.created / user.updated).
 * Internal — only callable from other Convex functions (e.g. HTTP webhook handler).
 */
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
      })
      return existing._id
    }

    return await ctx.db.insert("profiles", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      plan: "free",
    })
  },
})

/**
 * Delete profile from Clerk webhook (user.deleted).
 * Internal only.
 */
export const deleteByClerkId = internalMutation({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique()

    if (profile) {
      await ctx.db.delete(profile._id)
    }
    return null
  },
})

/**
 * Update voice profile settings.
 * Called from the Settings page.
 */
export const updateVoiceProfile = mutation({
  args: {
    profileId: v.id("profiles"),
    voiceProfile: v.object({
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

    // Verify ownership — the caller-specified profileId must match the auth'd user
    if (args.profileId !== profile._id) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Not authorized to update this profile" })
    }

    await ctx.db.patch(args.profileId, {
      voiceProfile: args.voiceProfile,
    })
    return null
  },
})

/**
 * Update profile fields from Settings page.
 * Uses Clerk auth — no profileId needed.
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    linkedInUrl: v.optional(v.string()),
    twitterHandle: v.optional(v.string()),
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

    await ctx.db.patch(profile._id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.linkedInUrl !== undefined && { linkedInUrl: args.linkedInUrl }),
      ...(args.twitterHandle !== undefined && { twitterHandle: args.twitterHandle }),
    })
    return null
  },
})

/**
 * Update user preferences toggles.
 * Called from the Settings page.
 */
export const updatePreferences = mutation({
  args: {
    auto: v.optional(v.boolean()),
    daily: v.optional(v.boolean()),
    weekly: v.optional(v.boolean()),
    discovery: v.optional(v.boolean()),
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

    const current = profile.preferences ?? {}
    await ctx.db.patch(profile._id, {
      preferences: {
        auto: args.auto ?? current.auto ?? false,
        daily: args.daily ?? current.daily ?? true,
        weekly: args.weekly ?? current.weekly ?? true,
        discovery: args.discovery ?? current.discovery ?? false,
      },
    })
    return null
  },
})
