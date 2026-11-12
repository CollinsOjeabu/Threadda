import { describe, expect, test } from "vitest"
import { NO_THINKING, readText, trimToLastSentence } from "../convex/lib/claude"
import { parseIdeas } from "../convex/lib/ideas"

// Review findings #3 and #6: Sonnet 5 thinks by default, so a response can
// open with a thinking block, and thinking spends max_tokens.

const ideasJson = JSON.stringify([
  { title: "Why research beats opinion", sourceCount: 2, agent: "authority", sourceIds: ["a", "b"] },
  { title: "The cost of hot takes", sourceCount: 1, agent: "authority", sourceIds: ["c"] },
])

describe("readText", () => {
  test("finds the answer after a thinking block (content[0] is not text)", () => {
    const r = readText({
      content: [{ type: "thinking" }, { type: "text", text: ideasJson }],
      stop_reason: "end_turn",
    })
    expect(r).toEqual({ text: ideasJson, truncated: false, refused: false })
    expect(parseIdeas(r.text)).toHaveLength(2)
  })

  test("flags a max_tokens cut-off", () => {
    const r = readText({
      content: [{ type: "text", text: ideasJson.slice(0, 60) }],
      stop_reason: "max_tokens",
    })
    expect(r.truncated).toBe(true)
  })

  test("flags a refusal and returns no text when there is none", () => {
    expect(readText({ content: [], stop_reason: "refusal" })).toEqual({
      text: "", truncated: false, refused: true,
    })
  })

  test("short tasks disable thinking", () => {
    expect(NO_THINKING).toEqual({ thinking: { type: "disabled" } })
  })
})

describe("parseIdeas", () => {
  test("returns [] for truncated JSON instead of throwing", () => {
    expect(parseIdeas(ideasJson.slice(0, 60))).toEqual([])
  })

  test("drops malformed entries and caps at 4", () => {
    const many = JSON.stringify([
      { title: "" }, null, { nope: 1 },
      ...Array.from({ length: 6 }, (_, i) => ({ title: `Idea ${i}` })),
    ])
    const ideas = parseIdeas("Here you go:\n" + many)
    expect(ideas).toHaveLength(4)
    expect(ideas[0]).toEqual({ title: "Idea 0", sourceCount: 0, agent: "authority", sourceIds: [] })
  })
})

describe("trimToLastSentence", () => {
  test("drops a trailing partial sentence", () => {
    expect(trimToLastSentence("First point. Second point. Third poi")).toBe("First point. Second point.")
  })
  test("returns empty when no sentence completed", () => {
    expect(trimToLastSentence("No full stop here")).toBe("")
  })
})
