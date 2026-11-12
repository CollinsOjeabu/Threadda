import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { internal } from "./_generated/api"
import { Webhook } from "svix"

const http = httpRouter()

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET
    if (!secret) {
      return new Response("Webhook secret not configured", { status: 500 })
    }

    const svix_id = req.headers.get("svix-id")
    const svix_timestamp = req.headers.get("svix-timestamp")
    const svix_signature = req.headers.get("svix-signature")
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 })
    }

    const body = await req.text()

    let evt: { type: string; data: Record<string, unknown> }
    try {
      evt = new Webhook(secret).verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as { type: string; data: Record<string, unknown> }
    } catch {
      return new Response("Invalid webhook signature", { status: 400 })
    }

    const { type, data } = evt
    const clerkId = data.id as string | undefined

    if (type === "user.deleted") {
      if (clerkId) {
        await ctx.runMutation(internal.users.deleteAllUserData, { clerkId })
      }
    } else if (type === "user.created" || type === "user.updated") {
      if (clerkId) {
        const emailArr = data.email_addresses as
          | Array<{ id: string; email_address: string }>
          | undefined
        const primaryId = data.primary_email_address_id as string | undefined
        const email =
          emailArr?.find((e) => e.id === primaryId)?.email_address ??
          emailArr?.[0]?.email_address ??
          ""

        const first = (data.first_name as string | null) ?? ""
        const last = (data.last_name as string | null) ?? ""
        const name = `${first} ${last}`.trim() || undefined
        const avatarUrl = (data.image_url as string | undefined) || undefined

        await ctx.runMutation(internal.users.syncFromClerk, {
          event: type === "user.created" ? "created" : "updated",
          clerkId,
          email,
          name,
          avatarUrl,
        })
      }
    }

    return new Response("OK", { status: 200 })
  }),
})

export default http
