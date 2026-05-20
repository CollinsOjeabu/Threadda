import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

/**
 * Daily 9:00 AM UTC — check for posts scheduled today and log a reminder.
 * Email notification is a stub — Clerk's email API requires a backend HTTP
 * endpoint or a third-party provider. For now this marks due posts in the
 * console so the frontend "Publish to LinkedIn" button handles the UX.
 */
crons.daily(
  "check-due-posts",
  { hourUTC: 9, minuteUTC: 0 },
  internal.cronHelpers.checkDuePosts,
)

export default crons
