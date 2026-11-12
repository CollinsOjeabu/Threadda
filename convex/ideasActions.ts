"use node"
import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import { CLAUDE_MODEL } from "./models"
import { NO_THINKING, readText } from "./lib/claude"
import { parseIdeas } from "./lib/ideas"

/**
 * Generate content ideas based on user's library items.
 * Returns an array of idea objects.
 * Split into separate "use node" file after @anthropic-ai/sdk upgrade to 0.104.0.
 */
export const getForUser = action({
  args: {},
  handler: async (ctx): Promise<
    Array<{
      title: string
      sourceCount: number
      agent: string
      sourceIds: string[]
    }>
  > => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const profile = await ctx.runQuery(internal.helpers.getProfileByClerkId, {
      clerkId: identity.subject,
    })
    if (!profile) throw new Error("Profile not found")

    const userId = profile._id

    // Fetch user's content items
    const items = await ctx.runQuery(internal.ideas._getUserContent, {
      userId,
      limit: 10,
    })

    if (items.length < 1) return []

    // Cost guard: every call below is a paid Claude request.
    await ctx.runMutation(internal.ideas._claimIdeasRequest, { profileId: userId })

    // Build sources context
    const sourcesText = items
      .map(
        (item, i) =>
          `${i + 1}. [${item._id}] "${item.title}" — ${(item.summary || item.rawText || "").slice(0, 200)}`
      )
      .join("\n")

    const prompt = `Based on these ${items.length} research sources, generate 4 LinkedIn content ideas.
SOURCES:
${sourcesText}

Return this exact JSON (no markdown, no preamble, ONLY the JSON array):
[
  {
    "title": "compelling angle in under 12 words",
    "sourceCount": <number of sources used>,
    "agent": "authority",
    "sourceIds": ["id1", "id2"]
  }
]`

    let response
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default
      const anthropic = new Anthropic()
      response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        // Short structured task: no thinking, so the budget is all answer.
        ...NO_THINKING,
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        system:
          "You are a content strategist. Generate content ideas based on research sources. Return ONLY valid JSON array, no markdown, no preamble.",
      })
    } catch (e) {
      console.error("Content ideas: Claude request failed", e)
      return []
    }

    const { text, truncated, refused } = readText(response)
    if (truncated) {
      // A cut-off JSON array would parse partially or not at all.
      console.error("Content ideas: response hit max_tokens; discarding partial output")
      return []
    }
    if (refused || !text) {
      console.error(`Content ideas: no usable text (stop_reason=${response.stop_reason})`)
      return []
    }

    return parseIdeas(text)
  },
})
