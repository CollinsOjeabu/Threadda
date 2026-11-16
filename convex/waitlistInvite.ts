"use node"

import { internalAction } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"
import { createClerkClient } from "@clerk/backend"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const SIGN_UP_URL = "https://threadda.com/sign-up"

/**
 * Invite one person into the app while Clerk sign-ups are restricted.
 *
 * Internal only: run it from the Convex dashboard (Functions → waitlistInvite:invite)
 * with `{ "email": "someone@example.com" }`. It sends a Clerk invitation that
 * lands on /sign-up, then stamps `invitedAt` on the matching waitlist row.
 * `ignoreExisting` makes a repeat invite for the same address a no-op on
 * Clerk's side instead of an error.
 *
 * Needs CLERK_SECRET_KEY in this deployment's environment.
 */
export const invite = internalAction({
  args: { email: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<{ invitationId: string; status: string; onWaitlist: boolean }> => {
    const email = args.email.trim().toLowerCase()
    if (!EMAIL_RE.test(email)) throw new Error(`Not a valid email address: ${args.email}`)

    const secretKey = process.env.CLERK_SECRET_KEY
    if (!secretKey) throw new Error("CLERK_SECRET_KEY is not set in this Convex deployment")

    const clerk = createClerkClient({ secretKey })
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: SIGN_UP_URL,
      ignoreExisting: true,
    })

    const { onWaitlist }: { onWaitlist: boolean } = await ctx.runMutation(internal.waitlist.markInvited, { email })
    return { invitationId: invitation.id, status: invitation.status, onWaitlist }
  },
})
