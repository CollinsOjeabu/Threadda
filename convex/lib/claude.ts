/**
 * Helpers for reading Claude Messages API responses safely.
 * Pure — no SDK import, so it is usable from both "use node" actions and tests.
 *
 * Why this exists: Claude Sonnet 5 thinks by default (omitting `thinking`
 * runs adaptive thinking). A response can therefore start with a `thinking`
 * block, and thinking tokens count against `max_tokens`. Code that read
 * `content[0].text`, or that budgeted max_tokens for the answer alone,
 * silently produced empty or cut-off output.
 */

/**
 * For short, structured tasks (summaries, JSON extraction, idea lists):
 * turn thinking off so the whole max_tokens budget goes to the answer.
 * Accepted on claude-sonnet-5 at the default effort (`high`) or lower.
 */
export const NO_THINKING = { thinking: { type: "disabled" } } as const

type ResponseLike = {
  content: ReadonlyArray<{ type: string; text?: string }>
  stop_reason: string | null
}

export type ReadResult = {
  /** All text blocks joined, trimmed. Thinking/other blocks are ignored. */
  text: string
  /** The model hit max_tokens: `text` is incomplete. */
  truncated: boolean
  /** The model declined the request. */
  refused: boolean
}

/**
 * Read the answer text from a response by block type, never by position,
 * and report whether it was cut off.
 */
export function readText(response: ResponseLike): ReadResult {
  const text = response.content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("")
    .trim()
  return {
    text,
    truncated: response.stop_reason === "max_tokens",
    refused: response.stop_reason === "refusal",
  }
}

/**
 * For prose answers that are still useful when cut off (e.g. a summary):
 * drop the trailing partial sentence. Returns "" if no full sentence remains.
 */
export function trimToLastSentence(text: string): string {
  const match = text.match(/^[\s\S]*[.!?](?=\s|$)/)
  return match ? match[0].trim() : ""
}
