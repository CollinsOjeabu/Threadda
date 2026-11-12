/** Pure parsing for ideasActions.getForUser — kept out of the "use node" file so it is testable. */

export type Idea = { title: string; sourceCount: number; agent: string; sourceIds: string[] }

/** Parse the model's JSON array, keeping only well-formed ideas. */
export function parseIdeas(text: string): Idea[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []
  let raw: unknown
  try {
    raw = JSON.parse(jsonMatch[0])
  } catch {
    console.error("Content ideas: response was not valid JSON")
    return []
  }
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (i): i is Idea =>
        !!i && typeof i === "object" && typeof (i as Idea).title === "string" && (i as Idea).title.trim() !== "",
    )
    .map((i) => ({
      title: i.title,
      sourceCount: typeof i.sourceCount === "number" ? i.sourceCount : 0,
      agent: typeof i.agent === "string" ? i.agent : "authority",
      sourceIds: Array.isArray(i.sourceIds) ? i.sourceIds.filter((x) => typeof x === "string") : [],
    }))
    .slice(0, 4)
}
