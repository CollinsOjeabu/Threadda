"use node"

import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import { ConvexError } from "convex/values"
import { CLAUDE_MODEL } from "./models"

/**
 * Analyze manual writing samples using Claude to generate a Voice DNA profile.
 */
export const analyzeManualSamples = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    // Fetch user profile
    const profile = await ctx.runQuery(internal.helpers.getProfileByClerkId, {
      clerkId: identity.subject,
    })

    if (!profile) throw new ConvexError("Profile not found")
    if (!profile.voiceRawSamples || profile.voiceRawSamples.length === 0) {
      throw new ConvexError("No voice samples found. Add samples in Settings.")
    }
    if (profile.voiceRawSamples.length < 2) {
      throw new ConvexError("Add at least 2 writing samples for analysis.")
    }

    // Rate-limit check: voiceDnaAnalyses
    await ctx.runMutation(internal.rateLimitHelpers.checkAndIncrementCounter, {
      profileId: profile._id,
      resource: "voiceDnaAnalyses",
    })

    const samples = profile.voiceRawSamples
    const samplesText = samples.map((s: string, i: number) => `SAMPLE ${i + 1}:\n${s}`).join("\n\n---\n\n")

    // Call Claude for voice analysis
    const Anthropic = (await import("@anthropic-ai/sdk")).default
    const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const result = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      system:
        "You are a writing voice analyst. Analyze writing samples and extract voice characteristics. Return ONLY valid JSON, no preamble, no markdown fences.",
      messages: [
        {
          role: "user",
          content: `Analyze these ${samples.length} writing samples from the same person and extract their voice profile.

${samplesText}

Return this exact JSON structure:
{
  "storytelling": 0-100,
  "technical": 0-100,
  "provocative": 0-100,
  "datadriven": 0-100,
  "formality": 0-100,
  "avgSentenceLength": number (estimated average words per sentence),
  "usesQuestions": boolean,
  "emojiUsage": "none" | "rare" | "moderate" | "frequent",
  "signaturePhrases": string[] (2-4 phrases that appear characteristic),
  "writingPersona": string (one sentence describing their voice)
}`,
        },
      ],
    })

    const textBlock = result.content.find((block) => block.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      throw new ConvexError("Failed to get response from Claude")
    }

    // Parse JSON (strip any markdown fences if present)
    let jsonStr = textBlock.text.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    let voiceProfile: Record<string, unknown>
    try {
      voiceProfile = JSON.parse(jsonStr)
    } catch {
      throw new ConvexError("Failed to parse voice profile from Claude response")
    }

    // Save to profile via internal mutation
    await ctx.runMutation(internal.helpers.saveVoiceProfile, {
      clerkId: identity.subject,
      voiceProfile: JSON.stringify({
        ...voiceProfile,
        trainedFrom: "manual_samples",
        trainingPostCount: samples.length,
        trainedAt: Date.now(),
      }),
    })

    return voiceProfile
  },
})
