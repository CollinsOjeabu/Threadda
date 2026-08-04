"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery, useConvexAuth } from "convex/react"
import { api } from "../../convex/_generated/api"

/**
 * Hook that returns the current user's Convex profile.
 *
 * The profile is created server-side by the Clerk `user.created` webhook
 * (convex/http.ts → users.upsertFromClerk). Callers should treat a null
 * profile as "not ready yet" and render a waiting state — this query is
 * reactive and resolves as soon as the webhook lands.
 *
 * Returns: { profile, isLoading, clerkUser }
 */
export function useCurrentUser() {
  const { user: clerkUser } = useUser()

  // Gate on Convex's own auth state, not Clerk's. Clerk can be loaded while
  // the Convex client is still unauthenticated, and in that window getCurrent
  // returns null (not undefined) — which would read as "loaded, no profile".
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth()

  // Query Convex for the authenticated user's profile
  const profile = useQuery(api.users.getCurrent, isAuthenticated ? {} : "skip")

  return {
    profile: profile ?? null,
    isLoading: authLoading || (isAuthenticated && profile === undefined),
    clerkUser,
  }
}
