import { mutation } from "./_generated/server"
import { v, ConvexError } from "convex/values"

const MAX_EMAIL_LENGTH = 254
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Join the landing-page early-access list.
 *
 * Public and unauthenticated, so it is deliberately minimal:
 * - touches only the `waitlist` table
 * - dedupes by normalized email and returns the same `{ ok: true }` whether or
 *   not the email was already on the list (no existence leak)
 * - `website` is a honeypot; if a bot fills it we return success without writing
 */
export const join = mutation({
  args: {
    email: v.string(),
    platform: v.union(v.literal("linkedin"), v.literal("x"), v.literal("both")),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.website && args.website.trim() !== "") {
      return { ok: true as const }
    }

    const email = args.email.trim().toLowerCase()
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
      throw new ConvexError("Please enter a valid email address.")
    }

    // Reading the index range makes concurrent joins for the same email
    // conflict and retry under Convex OCC, so this can't double-insert.
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first()

    if (!existing) {
      await ctx.db.insert("waitlist", {
        email,
        platform: args.platform,
        createdAt: Date.now(),
        source: "landing",
      })
    }

    return { ok: true as const }
  },
})
