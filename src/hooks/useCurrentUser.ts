"use client"

import { useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useQuery, useMutation, useConvexAuth } from "convex/react"
import { api } from "../../convex/_generated/api"

/**
 * Hook that returns the current user's Convex profile.
 *
 * Normally the profile is created server-side by the Clerk `user.created`
 * webhook (convex/http.ts → users.syncFromClerk). If the signed-in user has
 * no profile yet — webhook late, lost, or not configured — this hook calls
 * users.ensureMyProfile once. That mutation takes no arguments and builds
 * the profile from the verified auth token, and it is idempotent, so racing
 * the webhook (or another tab) still yields exactly one profile.
 *
 * Returns: { profile, isLoading, clerkUser, error }
 * `error` is set only if the fallback itself failed; `retry` tries again.
 */
export function useCurrentUser() {
  const { user: clerkUser } = useUser()

  // Gate on Convex's own auth state, not Clerk's. Clerk can be loaded while
  // the Convex client is still unauthenticated, and in that window getCurrent
  // returns null (not undefined) — which would read as "loaded, no profile".
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth()

  // Query Convex for the authenticated user's profile
  const profile = useQuery(api.users.getCurrent, isAuthenticated ? {} : "skip")

  const ensureMyProfile = useMutation(api.users.ensureMyProfile)
  const attempted = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Only once the query has answered "no profile" (null, not undefined).
    if (!isAuthenticated || profile !== null || attempted.current) return
    attempted.current = true
    ensureMyProfile({}).catch((e: unknown) => {
      console.error("ensureMyProfile failed:", e)
      setError("We couldn't set up your profile. Please try again.")
    })
    // The getCurrent subscription updates by itself once the row exists.
  }, [isAuthenticated, profile, ensureMyProfile, attempt])

  const retry = () => {
    attempted.current = false
    setError(null)
    setAttempt((n) => n + 1)
  }

  return {
    profile: profile ?? null,
    isLoading: authLoading || (isAuthenticated && profile === undefined),
    clerkUser,
    error,
    retry,
  }
}
