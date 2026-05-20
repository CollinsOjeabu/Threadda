"use node"

import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"
import { ConvexError } from "convex/values"
import type { Id } from "./_generated/dataModel"

/**
 * Full URL → content ingestion pipeline.
 * Firecrawl scrape → Claude summarization → OpenAI embedding → Convex storage.
 */
export const startIngestion = action({
  args: {
    url: v.string(),
    userId: v.id("profiles"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; title: string; summary: string; itemId: Id<"contentItems"> }> => {
    // Step 1: Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(args.url)
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol")
      }
    } catch {
      throw new ConvexError("Invalid URL. Must start with http:// or https://")
    }

    // Step 1a: Rate-limit check: ingestions
    await ctx.runMutation(internal.rateLimitHelpers.checkAndIncrementCounter, {
      profileId: args.userId,
      resource: "ingestions",
    })

    // Step 2: Scrape with Firecrawl v2 API
    const Firecrawl = (await import("@mendable/firecrawl-js")).default
    const firecrawl = new Firecrawl({
      apiKey: process.env.FIRECRAWL_API_KEY!,
    })

    let scrapeResult: { markdown?: string; metadata?: { title?: string } }
    try {
      scrapeResult = await firecrawl.scrape(args.url, {
        formats: ["markdown"],
        onlyMainContent: true,
      })
    } catch {
      throw new ConvexError(`Failed to scrape URL: ${args.url}`)
    }

    // Step 3: Extract title and text
    const title =
      scrapeResult.metadata?.title ||
      scrapeResult.markdown?.match(/^#\s+(.+)/m)?.[1] ||
      parsedUrl.hostname
    const rawText = (scrapeResult.markdown || "").slice(0, 8000)

    if (!rawText || rawText.trim().length < 20) {
      throw new ConvexError("No meaningful content found at that URL")
    }

    // Step 4: Summarize with Claude
    let summary = ""
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default
      const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

      const summaryResult = await claude.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system:
          "You are a research assistant. Extract the key insight from this article in 2-3 sentences. Be specific and factual. Focus on what is novel or actionable. Return only the summary, no preamble.",
        messages: [
          { role: "user", content: rawText.slice(0, 6000) },
        ],
      })

      const textBlock = summaryResult.content.find(
        (block: { type: string }) => block.type === "text",
      )
      summary = textBlock && "text" in textBlock ? (textBlock as { text: string }).text : ""
    } catch (e) {
      // Partial failure — save without summary
      console.error("Claude summarization failed:", e)
    }

    // Step 5: Generate embedding via OpenAI
    let embeddingStr = ""
    try {
      const OpenAI = (await import("openai")).default
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

      const embeddingResult = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: summary || rawText.slice(0, 2000),
      })

      const embedding = embeddingResult.data[0].embedding
      embeddingStr = JSON.stringify(embedding)
    } catch (e) {
      // Partial failure — save without embedding
      console.error("OpenAI embedding failed:", e)
    }

    // Step 6: Store in Convex
    const itemId: Id<"contentItems"> = await ctx.runMutation(internal.helpers.saveContentItem, {
      userId: args.userId,
      url: args.url,
      title: String(title).slice(0, 200),
      rawText,
      summary,
      embeddingId: embeddingStr, // legacy field — kept for backward compat
    })

    // Step 7: Store embedding in dedicated vector table + schedule edge compute
    if (embeddingStr) {
      try {
        const embeddingVector: number[] = JSON.parse(embeddingStr)
        await ctx.runMutation(internal.embeddings.storeEmbedding, {
          contentItemId: itemId,
          userId: args.userId,
          vector: embeddingVector,
        })

        // Schedule edge computation (fire-and-forget, 100ms delay so embedding commits first)
        await ctx.scheduler.runAfter(100, internal.graphCompute.computeEdgesForSource, {
          contentItemId: itemId,
        })
      } catch (e) {
        // Non-blocking — embedding table write or edge compute failure
        // does not break ingestion
        console.error("Failed to store embedding or schedule edge compute:", e)
      }
    }

    return { success: true, title: String(title), summary, itemId }
  },
})

/**
 * Get the ingestion status of a content item.
 */
export const getIngestionStatus = action({
  args: { itemId: v.id("contentItems") },
  handler: async (ctx, args): Promise<{ status: string; errorMessage?: string } | null> => {
    const item: { status: string; errorMessage?: string } | null = await ctx.runQuery(internal.helpers.getItemStatus, {
      itemId: args.itemId,
    })
    return item
  },
})

/**
 * Process raw text through the Claude summarization + OpenAI embedding pipeline.
 * Used for file uploads (PDF, TXT, MD) and any content that already has text
 * but needs AI processing (summary, embedding, knowledge graph edges).
 *
 * Mirrors startIngestion steps 4–7, skipping Firecrawl scrape.
 */
export const processRawText = action({
  args: {
    title: v.string(),
    rawText: v.string(),
    type: v.union(v.literal("note"), v.literal("pdf")),
  },
  handler: async (ctx, args): Promise<{ itemId: Id<"contentItems">; title: string; summary: string }> => {
    // Auth — resolve profile from Clerk identity
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not authenticated")

    const profile = await ctx.runQuery(internal.helpers.getProfileByClerkId, {
      clerkId: identity.subject,
    })
    if (!profile) throw new ConvexError("Profile not found")

    // Rate-limit check: ingestions
    await ctx.runMutation(internal.rateLimitHelpers.checkAndIncrementCounter, {
      profileId: profile._id,
      resource: "ingestions",
    })

    const truncatedText = args.rawText.slice(0, 8000)

    if (!truncatedText || truncatedText.trim().length < 20) {
      throw new ConvexError("File content is too short to process")
    }

    // Step 1: Claude generates a proper title + summary
    let title = args.title
    let summary = ""
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default
      const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

      const summaryResult = await claude.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `You are a research librarian. Read this content and return a JSON object with two fields:
1. "title": a specific, descriptive title (max 8 words) that captures the main topic
2. "summary": a factual 2-3 sentence summary of the key points

Content:
${truncatedText.slice(0, 6000)}

Respond with valid JSON only. No markdown, no preamble.`,
          },
        ],
      })

      const textBlock = summaryResult.content.find(
        (block: { type: string }) => block.type === "text",
      )
      const raw = textBlock && "text" in textBlock ? (textBlock as { text: string }).text : ""

      try {
        const parsed = JSON.parse(raw)
        if (parsed.title && typeof parsed.title === "string") title = parsed.title
        if (parsed.summary && typeof parsed.summary === "string") summary = parsed.summary
      } catch {
        // Claude returned non-JSON — use raw text as summary fallback
        summary = raw || truncatedText.slice(0, 300)
      }
    } catch (e) {
      console.error("Claude summarization failed:", e)
      summary = truncatedText.slice(0, 300)
    }

    // Step 2: OpenAI generates embedding
    let embeddingVector: number[] = []
    let embeddingStr = ""
    try {
      const OpenAI = (await import("openai")).default
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

      const embeddingResult = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: summary || truncatedText.slice(0, 2000),
      })

      embeddingVector = embeddingResult.data[0].embedding
      embeddingStr = JSON.stringify(embeddingVector)
    } catch (e) {
      console.error("OpenAI embedding failed:", e)
    }

    // Step 3: Store content item in Convex (direct insert — saveContentItem requires url)
    const itemId: Id<"contentItems"> = await ctx.runMutation(internal.helpers.insertContentItem, {
      userId: profile._id,
      type: args.type,
      title: String(title).slice(0, 200),
      rawText: truncatedText,
      summary,
      embeddingId: embeddingStr || undefined,
    })

    // Step 4: Store embedding in vector table + schedule edge compute
    if (embeddingVector.length > 0) {
      try {
        await ctx.runMutation(internal.embeddings.storeEmbedding, {
          contentItemId: itemId,
          userId: profile._id,
          vector: embeddingVector,
        })

        // Schedule edge computation (fire-and-forget, 100ms delay so embedding commits first)
        await ctx.scheduler.runAfter(100, internal.graphCompute.computeEdgesForSource, {
          contentItemId: itemId,
        })
      } catch (e) {
        console.error("Failed to store embedding or schedule edge compute:", e)
      }
    }

    return { itemId, title: String(title), summary }
  },
})
