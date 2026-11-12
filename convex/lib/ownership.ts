import { ConvexError } from "convex/values"
import type { Id } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"

/**
 * Upper bound on sources attached in a single write. Each id costs one
 * document read to validate, so an unbounded array is a cheap way to
 * amplify load.
 *
 * NOTE: this happens to equal content.list's default page size (50), which
 * is what bounds the canvas picker today. If that limit is ever raised,
 * raise this with it or users will be unable to attach everything they see.
 */
export const MAX_SOURCES_PER_WRITE = 50

/**
 * Assert that every id in `sourceIds` resolves to a contentItems row owned
 * by `profileId`, and return the ids deduplicated (first-seen order).
 * Throws ConvexError on the first failure.
 *
 * Callers must persist the RETURNED array, not their raw input: duplicates
 * would otherwise be stored and repeated in every later Claude prompt.
 *
 * The failure is deliberately indistinguishable between "this id does not
 * exist" and "this id belongs to someone else". Reporting them differently
 * would be an existence oracle — the same reason content.get returns null
 * rather than throwing on an ownership mismatch.
 *
 * Callers must resolve `profileId` from ctx.auth, never from client input.
 */
export async function assertOwnsSources(
  ctx: QueryCtx | MutationCtx,
  profileId: Id<"profiles">,
  sourceIds: Id<"contentItems">[],
): Promise<Id<"contentItems">[]> {
  // Cap the RAW length: checking only the deduped length let a request carry
  // thousands of copies of one id past the limit.
  if (sourceIds.length > MAX_SOURCES_PER_WRITE) {
    throw new ConvexError({
      code: "TOO_MANY_SOURCES",
      message: `You can attach at most ${MAX_SOURCES_PER_WRITE} sources at once.`,
    })
  }

  // Dedupe: each id costs one read to validate, and is stored once.
  const unique = Array.from(new Set(sourceIds))

  for (const id of unique) {
    const item = await ctx.db.get(id)
    if (!item || item.userId !== profileId) {
      throw new ConvexError({
        code: "INVALID_SOURCES",
        message: "One or more selected sources are unavailable.",
      })
    }
  }
  return unique
}
