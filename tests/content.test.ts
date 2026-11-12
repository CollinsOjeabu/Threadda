import { describe, expect, test } from "vitest"
import { api } from "../convex/_generated/api"
import { makeT } from "./setup"

const identity = { subject: "user_dana", issuer: "https://clerk.test", email: "dana@example.com" }

async function setup() {
  const t = makeT()
  const asDana = t.withIdentity(identity)
  const profileId = await asDana.mutation(api.users.ensureMyProfile, {})
  const id = await t.run((ctx) =>
    ctx.db.insert("contentItems", {
      userId: profileId, type: "article", title: "Old", rawText: "pipeline text", status: "error",
      errorMessage: "scrape failed",
    }),
  )
  return { t, asDana, id }
}

describe("content.update", () => {
  test("edits user-facing fields", async () => {
    const { asDana, id } = await setup()
    const item = await asDana.mutation(api.content.update, { id, title: "New", tags: ["a"] })
    expect(item).toMatchObject({ title: "New", tags: ["a"], status: "error", rawText: "pipeline text" })
  })

  test("rejects pipeline-only fields from the client", async () => {
    const { t, asDana, id } = await setup()
    for (const extra of [{ status: "ready" }, { rawText: "x" }, { embeddingId: "[]" }, { errorMessage: "" }]) {
      await expect(
        // Bypass the generated types the way a hand-written client could.
        asDana.mutation(api.content.update, { id, ...extra } as never),
      ).rejects.toThrow(/Validator|extra field|not in validator/i)
    }
    const item = await t.run((ctx) => ctx.db.get(id))
    expect(item).toMatchObject({ status: "error", rawText: "pipeline text", errorMessage: "scrape failed" })
  })
})
