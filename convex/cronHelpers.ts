import { internalQuery, internalMutation } from "./_generated/server"

/**
 * Internal query: find all posts scheduled for today (UTC midnight to midnight).
 */
export const getDuePosts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = new Date()
    const startOfDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    ).getTime()
    const endOfDay = startOfDay + 86400000 // 24h in ms

    // Get all scheduled posts
    const allScheduled = await ctx.db
      .query("agentPosts")
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .collect()

    // Filter to today
    return allScheduled.filter(
      (p) => p.scheduledAt != null && p.scheduledAt >= startOfDay && p.scheduledAt < endOfDay
    )
  },
})

/**
 * Internal mutation called by the daily cron.
 * Logs due posts. Email integration can be added here later
 * using a third-party provider (Resend, SendGrid, etc.).
 */
export const checkDuePosts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date()
    const startOfDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    ).getTime()
    const endOfDay = startOfDay + 86400000

    const allScheduled = await ctx.db
      .query("agentPosts")
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .collect()

    const duePosts = allScheduled.filter(
      (p) => p.scheduledAt != null && p.scheduledAt >= startOfDay && p.scheduledAt < endOfDay
    )

    if (duePosts.length === 0) {
      console.log("[cron] No posts due today")
      return
    }

    for (const post of duePosts) {
      const profile = await ctx.db.get(post.userId)
      const email = profile?.email ?? "unknown"
      const snippet = (post.title || post.body).slice(0, 60)
      console.log(
        `[cron] DUE POST — user: ${email}, post: "${snippet}", scheduledAt: ${new Date(post.scheduledAt!).toISOString()}`
      )
      // Future: send email via Resend/SendGrid here
      // Subject: "Your Threadda post is ready to publish"
      // Body: "Your post '{snippet}' is scheduled for today. Open Threadda to publish it to LinkedIn."
    }

    console.log(`[cron] ${duePosts.length} post(s) due today`)
  },
})
