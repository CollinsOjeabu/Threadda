"use node"
import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import { CLAUDE_MODEL } from "./models"

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

    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default
      const anthropic = new Anthropic()
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        system:
          "You are a content strategist. Generate content ideas based on research sources. Return ONLY valid JSON array, no markdown, no preamble.",
      })

      const text =
        response.content[0].type === "text" ? response.content[0].text : ""
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) return []

      const ideas = JSON.parse(jsonMatch[0])
      return Array.isArray(ideas) ? ideas.slice(0, 4) : []
    } catch {
      console.error("Failed to generate content ideas")
      return []
    }
  },
})
