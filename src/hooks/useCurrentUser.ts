"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery, useMutation, useConvexAuth } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useEffect } from "react"

/**
 * Hook that returns the current user's Convex profile,
 * auto-creating it from Clerk data on first visit.
 *
 * Returns: { profile, isLoading }
 */
export function useCurrentUser() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()

  // Gate on Convex's own auth state, not Clerk's. Clerk can be loaded while
  // the Convex client is still unauthenticated, and in that window getCurrent
  // returns null (not undefined) — which would read as "loaded, no profile".
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth()

  // Query Convex for the authenticated user's profile
  const profile = useQuery(api.users.getCurrent, isAuthenticated ? {} : "skip")

  const ensureProfile = useMutation(api.users.ensureProfile)

  // Auto-create profile if Clerk user exists but Convex profile doesn't
  useEffect(() => {
    if (clerkLoaded && clerkUser && profile === null) {
      ensureProfile({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        name: clerkUser.fullName ?? clerkUser.firstName ?? undefined,
        avatarUrl: clerkUser.imageUrl ?? undefined,
      })
    }
  }, [clerkLoaded, clerkUser, profile, ensureProfile])

  return {
    profile: profile ?? null,
    isLoading: authLoading || (isAuthenticated && profile === undefined),
    clerkUser,
  }
}
