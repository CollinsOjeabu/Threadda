import { describe, expect, test } from "vitest"
import { api, internal } from "../convex/_generated/api"
import { makeT } from "./setup"

// Review finding #12: without the Clerk webhook, a new user must still end
// up with exactly one profile, built only from the verified identity.

const identity = {
  subject: "user_alice",
  issuer: "https://clerk.test",
  email: "alice@example.com",
  name: "Alice Example",
  pictureUrl: "https://img.test/alice.png",
}

const countProfiles = (t: ReturnType<typeof makeT>, clerkId: string) =>
  t.run(async (ctx) =>
    (await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .collect()).length,
  )

describe("users.ensureMyProfile (webhook fallback)", () => {
  test("no webhook: creates the profile from the verified identity", async () => {
    const t = makeT()
    const asAlice = t.withIdentity(identity)

    expect(await asAlice.query(api.users.getCurrent, {})).toBeNull()
    await asAlice.mutation(api.users.ensureMyProfile, {})

    const profile = await asAlice.query(api.users.getCurrent, {})
    expect(profile).toMatchObject({
      clerkId: "user_alice",
      email: "alice@example.com",
      name: "Alice Example",
      plan: "free",
    })
  })

  test("two concurrent first logins produce exactly one profile", async () => {
    const t = makeT()
    const asAlice = t.withIdentity(identity)

    const [a, b] = await Promise.all([
      asAlice.mutation(api.users.ensureMyProfile, {}),
      asAlice.mutation(api.users.ensureMyProfile, {}),
    ])
    expect(a).toEqual(b)
    expect(await countProfiles(t, "user_alice")).toBe(1)
  })

  test("fallback racing the user.created webhook still yields one profile", async () => {
    const t = makeT()
    const asAlice = t.withIdentity(identity)

    await Promise.all([
      asAlice.mutation(api.users.ensureMyProfile, {}),
      t.mutation(internal.users.syncFromClerk, {
        event: "created",
        clerkId: "user_alice",
        email: "alice@example.com",
        name: "Alice Example",
      }),
      asAlice.mutation(api.users.ensureMyProfile, {}),
    ])
    expect(await countProfiles(t, "user_alice")).toBe(1)
  })

  test("takes no client input and rejects unauthenticated callers", async () => {
    const t = makeT()
    // The args validator is empty: a browser cannot supply a clerkId/email.
    await expect(
      // @ts-expect-error — no arguments are accepted
      t.withIdentity(identity).mutation(api.users.ensureMyProfile, { clerkId: "user_mallory" }),
    ).rejects.toThrow()
    await expect(t.mutation(api.users.ensureMyProfile, {})).rejects.toThrow(/Not authenticated/)
    expect(await countProfiles(t, "user_mallory")).toBe(0)
  })
})

describe("users.syncFromClerk (webhook)", () => {
  test("user.updated never creates a profile (no resurrection after user.deleted)", async () => {
    const t = makeT()
    await t.mutation(internal.users.syncFromClerk, {
      event: "created", clerkId: "user_bob", email: "bob@example.com",
    })
    await t.mutation(internal.users.deleteAllUserData, { clerkId: "user_bob" })

    // A late, out-of-order update for the deleted user:
    const result = await t.mutation(internal.users.syncFromClerk, {
      event: "updated", clerkId: "user_bob", email: "bob@example.com",
    })
    expect(result).toBeNull()
    expect(await countProfiles(t, "user_bob")).toBe(0)
  })

  test("user.updated does not overwrite a name edited in Threadda", async () => {
    const t = makeT()
    const asAlice = t.withIdentity(identity)
    await asAlice.mutation(api.users.ensureMyProfile, {})
    await asAlice.mutation(api.users.updateProfile, { name: "Ali" })

    await t.mutation(internal.users.syncFromClerk, {
      event: "updated",
      clerkId: "user_alice",
      email: "alice@new.example.com",
      name: "Alice Example",
      avatarUrl: "https://img.test/new.png",
    })
    const profile = await asAlice.query(api.users.getCurrent, {})
    expect(profile).toMatchObject({
      name: "Ali",
      email: "alice@new.example.com",
      avatarUrl: "https://img.test/new.png",
    })
  })
})
