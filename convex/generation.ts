"use node"

import { action } from "./_generated/server"
import { api, internal } from "./_generated/api"
import { v, ConvexError } from "convex/values"

/* ── Voice profile type from Claude analysis ── */
interface VoiceDna {
  storytelling?: number
  technical?: number
  provocative?: number
  datadriven?: number
  formality?: number
  writingPersona?: string
  signaturePhrases?: string[]
  emojiUsage?: string
  usesQuestions?: boolean
  avgSentenceLength?: number
}

/* ── Dynamic system prompt builders ── */

function buildAuthorityPrompt(displayName: string, voice: VoiceDna | null): string {
  let voiceSection = ""
  if (voice) {
    voiceSection = `
Their voice profile:
- Storytelling: ${voice.storytelling ?? 50}% | Technical: ${voice.technical ?? 50}% | Provocative: ${voice.provocative ?? 30}%
- Data-driven: ${voice.datadriven ?? 40}% | Formality: ${voice.formality ?? 60}%
- Writing persona: ${voice.writingPersona ?? "Professional, clear communicator"}
- Signature phrases: ${voice.signaturePhrases?.join(", ") ?? "none identified"}
- Emoji usage: ${voice.emojiUsage ?? "none"} | Uses questions: ${voice.usesQuestions ? "yes" : "rarely"}
- Avg sentence length: ~${voice.avgSentenceLength ?? 15} words`
  } else {
    voiceSection = `\nNo voice profile trained yet — write in a professional, approachable tone.`
  }

  return `You are The Authority (agent E-LI-772), a LinkedIn content strategist.
You write on behalf of ${displayName}.
${voiceSection}

OUTPUT FORMAT:
Your output is rendered directly to LinkedIn as plain text. LinkedIn does NOT render markdown. Do not use any markdown syntax in your output:
- No asterisks for bold or italics
- No ## or # for headings
- No --- or *** for separators
- No backticks for code
- No > for quotes
- No bullet points with - or *

The only formatting LinkedIn renders is line breaks. Use single newlines between paragraphs and double newlines for visual spacing.

LinkedIn post rules:
- Max 3000 characters
- No more than 5 hashtags, placed at the very end
- Opens with a single-line hook (no "I" as the first word)
- Uses line breaks between paragraphs (LinkedIn renders them)
- Ends with a question or provocation that invites comments
- Voice match target: sound exactly like ${displayName}, not like AI
- Use short paragraphs (1-3 sentences max) — LinkedIn rewards whitespace
- Include a clear insight or framework the reader can use immediately
- Never use corporate jargon: "synergy", "leverage", "align", "circle back"
- Target 150-250 words (LinkedIn sweet spot)

You MUST also self-assess how closely the output matches ${displayName}'s voice.`
}

function buildCatalystPrompt(displayName: string, voice: VoiceDna | null): string {
  let voiceSection = ""
  if (voice) {
    voiceSection = `
Their voice profile:
- Storytelling: ${voice.storytelling ?? 50}% | Technical: ${voice.technical ?? 50}% | Provocative: ${voice.provocative ?? 30}%
- Data-driven: ${voice.datadriven ?? 40}% | Formality: ${voice.formality ?? 60}%
- Writing persona: ${voice.writingPersona ?? "Sharp, direct communicator"}`
  } else {
    voiceSection = `\nNo voice profile trained yet — write in a sharp, direct tone.`
  }

  return `You are The Catalyst (agent E-TW-119), an X/Twitter content strategist.
You write on behalf of ${displayName}.
${voiceSection}

OUTPUT FORMAT:
Your output is rendered directly to X/Twitter as plain text. X does NOT render markdown. Do not use any markdown syntax in your output:
- No asterisks for bold or italics
- No ## or # for headings
- No --- or *** for separators
- No backticks for code
- No > for quotes
- No bullet points with - or *

X/Twitter post rules:
- Max 280 characters for a single tweet
- If content warrants a thread: number each tweet [1/N], [2/N] etc.
- Punchy, declarative opening
- No filler phrases ("In conclusion", "It's important to note")
- Max 2 hashtags total
- Voice match target: sound exactly like ${displayName}, not like AI

You MUST also self-assess how closely the output matches ${displayName}'s voice.`
}

/* ── Read voice profile from typed schema ── */
function parseVoiceProfile(profile: {
  voiceProfile?: VoiceDna | undefined
}): VoiceDna | null {
  if (!profile?.voiceProfile) return null
  return profile.voiceProfile
}

/* ── JSON parsing helper ── */
function parseJsonResponse(raw: string): { title: string; body: string; voiceMatchScore: number; platform: string } {
  let cleaned = raw.trim()
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
  }
  return JSON.parse(cleaned)
}

/**
 * Generate a post from canvas sources + voice profile using Claude.
 * Returns structured JSON with title, body, voiceMatchScore.
 */
export const generatePost = action({
  args: {
    sessionId: v.id("canvasSessions"),
    agent: v.union(v.literal("authority"), v.literal("catalyst")),
    platform: v.union(v.literal("linkedin"), v.literal("x")),
    userInstruction: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ postId: string; title: string; body: string; voiceMatchScore: number; platform: string }> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    // 1. Fetch session + verify ownership
    const session = await ctx.runQuery(internal.canvasChatHelpers.getSessionForChat, {
      sessionId: args.sessionId,
      clerkId: identity.subject,
    })
    if (!session) throw new ConvexError("Session not found or access denied")

    // 2. Fetch source content texts
    const sourceContext = await ctx.runQuery(internal.canvasChatHelpers.getSourceTexts, {
      sourceIds: session.sourceIds,
    })

    // 3. Fetch user profile + parse voice DNA
    const profile = await ctx.runQuery(internal.helpers.getProfileByClerkId, {
      clerkId: identity.subject,
    })
    if (!profile) throw new ConvexError("Profile not found")

    const displayName = profile.name ?? "the user"
    const voice = parseVoiceProfile(profile)

    // 3a. Rate-limit check: generations
    await ctx.runMutation(internal.rateLimitHelpers.checkAndIncrementCounter, {
      profileId: profile._id,
      resource: "generations",
    })

    // 4. Build agent-specific system prompt
    const systemPrompt = args.agent === "authority"
      ? buildAuthorityPrompt(displayName, voice)
      : buildCatalystPrompt(displayName, voice)

    // 5. Build source material block
    const sourceIds = session.sourceIds
    const sourceItems = await Promise.all(
      sourceIds.map((id) => ctx.runQuery(internal.canvasChatHelpers.getSourceTexts, { sourceIds: [id] }))
    )

    // 6. Get recent chat history
    const chatHistory = session.chatHistory ?? []
    const recentChat = chatHistory.slice(-6)
    let conversationBlock = ""
    if (recentChat.length > 0) {
      conversationBlock = "\n\nRECENT CONVERSATION:\n" +
        recentChat.map((msg: { role: string; content: string }) =>
          `${msg.role.toUpperCase()}: ${msg.content}`
        ).join("\n")
    }

    // 7. Build user prompt
    const platformLabel = args.platform === "linkedin" ? "LinkedIn" : "X"
    const userPrompt = `RESEARCH SOURCES (${sourceIds.length} items):
${sourceContext}
${conversationBlock}
${args.userInstruction ? `\nSPECIFIC INSTRUCTION: ${args.userInstruction}` : ""}

Generate a ${platformLabel} post that synthesises these sources. The post should reflect the angle explored in the conversation above. Return ONLY valid JSON:
{
  "title": "5-7 word summary of the post angle",
  "body": "the full post text",
  "voiceMatchScore": 0-100,
  "platform": "${args.platform}"
}`

    // 8. Call Claude
    const Anthropic = (await import("@anthropic-ai/sdk")).default
    const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    let response
    try {
      response = await claude.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      })
    } catch {
      throw new ConvexError("Our AI is temporarily unavailable. Please try again in a moment.")
    }

    const textBlock = response.content.find(
      (block: { type: string }) => block.type === "text"
    )
    const rawText = textBlock && "text" in textBlock
      ? (textBlock as { text: string }).text.trim()
      : ""

    if (!rawText) {
      throw new ConvexError("Claude returned an empty response. Please try again.")
    }

    // 9. Parse structured JSON
    let parsed: { title: string; body: string; voiceMatchScore: number; platform: string }
    try {
      parsed = parseJsonResponse(rawText)
    } catch {
      // Fallback: treat entire response as body
      parsed = {
        title: rawText.split("\n")[0]?.slice(0, 80) ?? "Untitled draft",
        body: rawText,
        voiceMatchScore: 70,
        platform: args.platform,
      }
    }

    // 10. Create the draft post
    const postId = await ctx.runMutation(api.posts.create, {
      agent: args.agent,
      platform: args.platform,
      body: parsed.body,
      sourceContentIds: session.sourceIds,
      title: parsed.title,
      voiceMatchScore: Math.round(parsed.voiceMatchScore),
    })

    return {
      postId,
      title: parsed.title,
      body: parsed.body,
      voiceMatchScore: Math.round(parsed.voiceMatchScore),
      platform: parsed.platform ?? args.platform,
    }
  },
})

/**
 * Regenerate a post incorporating feedback.
 * Old post remains as history; a new draft is created.
 */
export const regeneratePost = action({
  args: {
    postId: v.id("agentPosts"),
    feedback: v.string(),
  },
  handler: async (ctx, args): Promise<{ postId: string; body: string; voiceMatchScore: number }> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    // 1. Fetch existing post
    const profile = await ctx.runQuery(internal.helpers.getProfileByClerkId, {
      clerkId: identity.subject,
    })
    if (!profile) throw new ConvexError("Profile not found")

    // Fetch the post directly via a list query (actions can't use ctx.db)
    const allPosts = await ctx.runQuery(api.posts.list, {
      userId: profile._id,
    })
    const existingPost = allPosts.find((p) => p._id === args.postId)
    if (!existingPost) throw new ConvexError("Post not found")

    // 2. Fetch source content
    const sourceContext = await ctx.runQuery(internal.canvasChatHelpers.getSourceTexts, {
      sourceIds: existingPost.sourceContentIds,
    })

    // 3. Get voice profile
    const displayName = profile.name ?? "the user"
    const voice = parseVoiceProfile(profile)

    // 2a. Rate-limit check: generations
    await ctx.runMutation(internal.rateLimitHelpers.checkAndIncrementCounter, {
      profileId: profile._id,
      resource: "generations",
    })

    const systemPrompt = existingPost.agent === "authority"
      ? buildAuthorityPrompt(displayName, voice)
      : buildCatalystPrompt(displayName, voice)

    // 4. Build regeneration prompt
    const platformLabel = existingPost.platform === "linkedin" ? "LinkedIn" : "X"
    const userPrompt = `ORIGINAL SOURCE MATERIAL:
${sourceContext}

PREVIOUS DRAFT:
${existingPost.body}

FEEDBACK FROM ${displayName.toUpperCase()}:
${args.feedback}

Rewrite the ${platformLabel} post incorporating this feedback. Return ONLY valid JSON:
{
  "title": "5-7 word summary of the post angle",
  "body": "the full rewritten post text",
  "voiceMatchScore": 0-100,
  "platform": "${existingPost.platform}"
}`

    // 5. Call Claude
    const Anthropic = (await import("@anthropic-ai/sdk")).default
    const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    let response
    try {
      response = await claude.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      })
    } catch {
      throw new ConvexError("Our AI is temporarily unavailable. Please try again in a moment.")
    }

    const textBlock = response.content.find(
      (block: { type: string }) => block.type === "text"
    )
    const rawText = textBlock && "text" in textBlock
      ? (textBlock as { text: string }).text.trim()
      : ""

    if (!rawText) throw new ConvexError("Claude returned an empty response.")

    // 6. Parse JSON
    let parsed: { title: string; body: string; voiceMatchScore: number; platform: string }
    try {
      parsed = parseJsonResponse(rawText)
    } catch {
      parsed = {
        title: existingPost.title ?? "Revised draft",
        body: rawText,
        voiceMatchScore: 70,
        platform: existingPost.platform,
      }
    }

    // 7. Create new draft (old remains as history)
    const postId = await ctx.runMutation(api.posts.create, {
      agent: existingPost.agent,
      platform: existingPost.platform,
      body: parsed.body,
      sourceContentIds: existingPost.sourceContentIds,
      title: parsed.title,
      voiceMatchScore: Math.round(parsed.voiceMatchScore),
    })

    return {
      postId,
      body: parsed.body,
      voiceMatchScore: Math.round(parsed.voiceMatchScore),
    }
  },
})
