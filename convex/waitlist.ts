import { mutation } from "./_generated/server"
import { components } from "./_generated/api"
import { v, ConvexError } from "convex/values"
import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter"

const MAX_EMAIL_LENGTH = 254
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Global cap on new waitlist rows. Mutations can't see the caller's IP, so
 * this is one shared bucket for everyone: it bounds how fast a script can
 * fill the table, not who is calling. Only new inserts spend a token;
 * repeat joins for an existing email are free (they write nothing).
 */
export const WAITLIST_JOINS_PER_MINUTE = 30
const rateLimiter = new RateLimiter(components.rateLimiter, {
  waitlistJoin: { kind: "fixed window", rate: WAITLIST_JOINS_PER_MINUTE, period: MINUTE },
})

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
      // Over the cap: answer exactly like a successful join so the limit
      // isn't observable. The row is not written.
      const { ok } = await rateLimiter.limit(ctx, "waitlistJoin")
      if (!ok) return { ok: true as const }

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
