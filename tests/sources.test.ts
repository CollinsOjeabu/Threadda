import { describe, expect, test } from "vitest"
import { api, internal } from "../convex/_generated/api"
import type { Id } from "../convex/_generated/dataModel"
import { makeT } from "./setup"

// Review findings #5 (duplicate ids) and #7 (sources deleted mid-session).

const identity = { subject: "user_carol", issuer: "https://clerk.test", email: "carol@example.com" }

async function setup() {
  const t = makeT()
  const asCarol = t.withIdentity(identity)
  const profileId = await asCarol.mutation(api.users.ensureMyProfile, {})
  await t.run((ctx) => ctx.db.patch(profileId, { plan: "internal" })) // skip quota
  const ids = await t.run(async (ctx) => {
    const out: Id<"contentItems">[] = []
    for (const title of ["One", "Two"]) {
      out.push(await ctx.db.insert("contentItems", {
        userId: profileId, type: "note", title, rawText: `${title} body`, status: "ready",
      }))
    }
    return out
  })
  return { t, asCarol, profileId, ids }
}

describe("source ids", () => {
  test("duplicates are stored once", async () => {
    const { t, asCarol, ids } = await setup()
    const sessionId = await asCarol.mutation(api.canvas.createSession, {
      name: "s", sourceIds: [ids[0], ids[0], ids[1], ids[0]],
    })
    const session = await t.run((ctx) => ctx.db.get(sessionId))
    expect(session?.sourceIds).toEqual([ids[0], ids[1]])

    const postId = await asCarol.mutation(api.posts.create, {
      agent: "authority", platform: "linkedin", body: "b",
      sourceContentIds: [ids[1], ids[1], ids[1]],
    })
    const post = await t.run((ctx) => ctx.db.get(postId))
    expect(post?.sourceContentIds).toEqual([ids[1]])
  })

  test("the cap applies to the raw count, so mass duplicates are rejected", async () => {
    const { asCarol, ids } = await setup()
    await expect(
      asCarol.mutation(api.canvas.createSession, { name: "s", sourceIds: Array(51).fill(ids[0]) }),
    ).rejects.toThrow(/at most 50/)
  })

  test("getSourceTexts reports only sources that still exist", async () => {
    const { t, profileId, ids } = await setup()
    await t.run((ctx) => ctx.db.delete(ids[0]))
    const result = await t.query(internal.canvasChatHelpers.getSourceTexts, {
      sourceIds: [ids[0], ids[1], ids[1]], profileId,
    })
    expect(result.liveSourceIds).toEqual([ids[1]])
    expect(result.context).toContain("Two")
    expect(result.context).not.toContain("One")
  })

  test("getSourceTexts reports only the sources that fit in the prompt", async () => {
    const { t, profileId } = await setup()
    // Six ~3,000-char sources: the 15,000-char cap keeps the first four.
    const ids = await t.run(async (ctx) => {
      const out: Id<"contentItems">[] = []
      for (let i = 0; i < 6; i++) {
        out.push(await ctx.db.insert("contentItems", {
          userId: profileId, type: "note", title: `Long ${i}`, rawText: "x".repeat(5000), status: "ready",
        }))
      }
      return out
    })
    const result = await t.query(internal.canvasChatHelpers.getSourceTexts, { sourceIds: ids, profileId })
    expect(result.liveSourceIds).toEqual(ids)
    expect(result.includedSourceIds).toEqual(ids.slice(0, 4))
    expect(result.context.split("<source>").length - 1).toBe(4)
    expect(result.context).toContain("Long 3")
    expect(result.context).not.toContain("Long 4")
  })
})
