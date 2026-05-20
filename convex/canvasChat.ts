"use node"

import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"
import { ConvexError } from "convex/values"

/**
 * Send a message to the Canvas AI agent.
 * Reads source context, generates Claude response, persists both messages.
 */
export const sendMessage = action({
  args: {
    sessionId: v.id("canvasSessions"),
    message: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    // 1. Get session data
    const session = await ctx.runQuery(internal.canvasChatHelpers.getSessionForChat, {
      sessionId: args.sessionId,
      clerkId: identity.subject,
    })
    if (!session) throw new ConvexError("Session not found")

    // 2. Get source content for context
    const sourceContext = await ctx.runQuery(internal.canvasChatHelpers.getSourceTexts, {
      sourceIds: session.sourceIds,
    })

    // 3. Get voice profile for persona context
    const profile = await ctx.runQuery(internal.helpers.getProfileByClerkId, {
      clerkId: identity.subject,
    })
    if (!profile) throw new ConvexError("Profile not found")
    const displayName = profile.name ?? "the user"

    // 3a. Rate-limit check: generations
    await ctx.runMutation(internal.rateLimitHelpers.checkAndIncrementCounter, {
      profileId: profile._id,
      resource: "generations",
    })

    let voiceContext = ""
    if (profile?.voiceProfile) {
      const vp = profile.voiceProfile
      const traits: string[] = []
      if ((vp.storytelling ?? 0) >= 60) traits.push("storytelling")
      if ((vp.technical ?? 0) >= 60) traits.push("technical depth")
      if ((vp.provocative ?? 0) >= 60) traits.push("provocative takes")
      if ((vp.datadriven ?? 0) >= 60) traits.push("data-driven arguments")
      const top2 = traits.slice(0, 2).join(" and ") || "clarity and directness"
      voiceContext = `\n\nVoice context for ${displayName}:\n${vp.writingPersona ?? "Professional communicator"}\nLean toward: ${top2}`
    }

    // 4. Build conversation history for Claude
    const history = session.chatHistory ?? []
    const claudeMessages: Array<{ role: "user" | "assistant"; content: string }> = []

    for (const msg of history) {
      claudeMessages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })
    }

    // Add the new user message
    claudeMessages.push({ role: "user", content: args.message })

    // 5. Build system prompt
    const systemPrompt = `You are The Authority, a sharp, focused creative collaborator working with ${displayName} on LinkedIn content. You help find angles, test ideas, and draft posts.

VOICE AND FORMATTING:
Write the way a thoughtful colleague speaks — conversational, direct, with a clear point of view. Most responses should be plain prose: short paragraphs, no headings, no bullet points. Reserve formatting for two cases only:
1. When the user explicitly asks for distinct items (e.g., "give me three angles") — present each as a numbered item with a brief expansion.
2. When you are drafting actual post content — format that draft naturally for LinkedIn.

For everything else, write in flowing prose. When connecting multiple thoughts, use sentence-starters like "First," "What stands out next," "And the deeper point" — never bullet syntax. Vary sentence length. Don't hedge with "great question" or "let me think about this." Just respond.

CONVERSATION RULES:
- Keep responses under 120 words unless drafting a full post
- Match the user's energy: if they're exploring, explore with them; if they want a draft, deliver it clean
- When asked for angles, give 2-3 specific opinionated options with a clear point of view — never vague suggestions
- When asked to draft, write the full draft with no preamble before or explanation after
- Never comment on source quality, completeness, or credibility — work with what you have
- Never say "this appears to be," "I should note that," "it's worth mentioning," "as an AI" — just respond

The user has loaded these research sources:

${sourceContext}${voiceContext}`

    // 6. Call Claude
    const Anthropic = (await import("@anthropic-ai/sdk")).default
    const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    let response
    try {
      response = await claude.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: systemPrompt,
        messages: claudeMessages,
      })
    } catch {
      throw new ConvexError("Our AI is temporarily unavailable. Please try again in a moment.")
    }

    const textBlock = response.content.find(
      (block: { type: string }) => block.type === "text"
    )
    const agentResponse = textBlock && "text" in textBlock
      ? (textBlock as { text: string }).text
      : "Sorry, I couldn't generate a response. Please try again."

    // 7. Persist both messages
    await ctx.runMutation(internal.helpers.appendCanvasMessages, {
      sessionId: args.sessionId,
      userMessage: args.message,
      agentResponse,
      timestamp: Date.now(),
    })

    return agentResponse
  },
})
