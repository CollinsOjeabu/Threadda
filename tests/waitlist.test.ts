import { describe, expect, test } from "vitest"
import rateLimiterTest from "@convex-dev/rate-limiter/test"
import { api } from "../convex/_generated/api"
import { WAITLIST_JOINS_PER_MINUTE } from "../convex/waitlist"
import { makeT } from "./setup"

const setup = () => {
  const t = makeT()
  rateLimiterTest.register(t)
  return t
}

const rows = (t: ReturnType<typeof setup>) =>
  t.run(async (ctx) => (await ctx.db.query("waitlist").collect()).length)

describe("waitlist.join", () => {
  test("stores a normalized email once and answers the same both times", async () => {
    const t = setup()
    const a = await t.mutation(api.waitlist.join, { email: "  Ada@Example.com ", platform: "x" })
    const b = await t.mutation(api.waitlist.join, { email: "ada@example.com", platform: "linkedin" })
    expect(a).toEqual({ ok: true })
    expect(b).toEqual({ ok: true })
    expect(await rows(t)).toBe(1)
  })

  test("honeypot: reports success, writes nothing", async () => {
    const t = setup()
    const r = await t.mutation(api.waitlist.join, { email: "bot@example.com", platform: "x", website: "spam" })
    expect(r).toEqual({ ok: true })
    expect(await rows(t)).toBe(0)
  })

  test("over the global cap: same neutral response, no extra rows", async () => {
    const t = setup()
    for (let i = 0; i < WAITLIST_JOINS_PER_MINUTE + 5; i++) {
      const r = await t.mutation(api.waitlist.join, { email: `u${i}@example.com`, platform: "both" })
      expect(r).toEqual({ ok: true })
    }
    expect(await rows(t)).toBe(WAITLIST_JOINS_PER_MINUTE)
  })

  test("repeat joins for an existing email don't spend the cap", async () => {
    const t = setup()
    for (let i = 0; i < WAITLIST_JOINS_PER_MINUTE + 5; i++) {
      await t.mutation(api.waitlist.join, { email: "same@example.com", platform: "x" })
    }
    await t.mutation(api.waitlist.join, { email: "new@example.com", platform: "x" })
    expect(await rows(t)).toBe(2)
  })

  test("still rejects malformed emails", async () => {
    const t = setup()
    await expect(t.mutation(api.waitlist.join, { email: "nope", platform: "x" })).rejects.toThrow()
  })
})
