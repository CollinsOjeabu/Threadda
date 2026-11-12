"use client"

import { useState, type FormEvent } from "react"
import { useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import { api } from "../../../convex/_generated/api"

type Platform = "linkedin" | "x" | "both"
type Status = "idle" | "submitting" | "success" | "error"

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "both", label: "Both" },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function EarlyAccessForm() {
  const join = useMutation(api.waitlist.join)
  const [email, setEmail] = useState("")
  const [platform, setPlatform] = useState<Platform>("both")
  const [website, setWebsite] = useState("") // honeypot
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === "submitting") return

    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error")
      setError("Please enter a valid email address.")
      return
    }

    setStatus("submitting")
    setError(null)
    try {
      await join({ email: trimmed, platform, website: website || undefined })
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(
        err instanceof ConvexError && typeof err.data === "string"
          ? err.data
          : "Something went wrong. Please try again in a moment.",
      )
    }
  }

  const card = "rounded-[0.875rem] border border-[#e6e6e6] bg-lp-paper px-[1.25rem] pt-[2.25rem] pb-[2.3125rem] sm:px-[2.25rem]"

  if (status === "success") {
    return (
      <div className={`${card} lp-swap`} role="status" aria-live="polite">
        <h3 className="h-display text-[1.25rem] leading-[1.75rem] tracking-[-0.03em]">You&apos;re on the list — we&apos;ll write once when your wave opens.</h3>
        <p className="mt-3 text-[0.6875rem] text-lp-muted">No credit card. Nothing to install.</p>
      </div>
    )
  }

  const submitting = status === "submitting"

  return (
    <form className={`${card} relative`} onSubmit={onSubmit} noValidate>
      <h3 className="h-display text-[1.25rem] leading-[1.75rem] tracking-[-0.03em]">Get in on the good stuff.</h3>
      <p className="mt-[0.75rem] text-[0.8125rem] leading-[1rem] text-lp-muted">Small waves. Thoughtful product. You, first.</p>

      <label htmlFor="ea-email" className="mt-[2rem] block text-[0.75rem] leading-[0.9375rem] font-medium text-lp-ink">Work email</label>
      <input
        id="ea-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={status === "error" ? true : undefined}
        aria-describedby={error ? "ea-error" : undefined}
        className="mt-[0.625rem] h-[3rem] w-full rounded-[0.625rem] border border-[#d3d1ca] bg-[#f7f7f2] px-[1rem] text-[1rem] sm:text-[0.8125rem] text-lp-ink placeholder:text-[#a8a7ab] outline-none transition-colors focus:border-lp-blue focus:bg-lp-paper"
      />

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[625rem] top-auto w-px h-px overflow-hidden">
        <label htmlFor="ea-website">Website</label>
        <input
          id="ea-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <p id="ea-platform-label" className="mt-[1.25rem] text-[0.75rem] leading-[0.9375rem] font-medium text-lp-ink">I publish on</p>
      <div role="group" aria-labelledby="ea-platform-label" className="mt-[0.5625rem] grid grid-cols-3 gap-[0.625rem] text-[0.8125rem] sm:gap-[0.8125rem]">
        {PLATFORMS.map((p) => {
          const active = platform === p.value
          return (
            <button
              key={p.value}
              type="button"
              aria-pressed={active}
              onClick={() => setPlatform(p.value)}
              className={`lp-press h-[2.5rem] cursor-pointer rounded-[0.625rem] border ${
                active
                  ? "border-[#5a6ff2] bg-[#f1f3fb] text-lp-blue"
                  : "border-[#dad9d3] text-lp-body hover:border-lp-ink/30"
              }`}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="lp-hover lp-press mt-[1.5rem] flex h-[3rem] w-full cursor-pointer items-center justify-between rounded-[0.625rem] bg-lp-blue px-[1.25rem] text-[0.8125rem] font-semibold text-white hover:bg-lp-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Joining…" : "Request early access"}
        <svg aria-hidden="true" viewBox="0 0 10 10" className="lp-nudge-ne h-[0.5625rem] w-[0.5625rem]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8 8 2M3.5 2H8v4.5" /></svg>
      </button>

      <p id="ea-error" role="alert" className="mt-3 text-center text-[0.8125rem] text-[#b42318] empty:hidden">
        {error}
      </p>
      <p className="mt-[1rem] text-center text-[0.6875rem] leading-[0.875rem] text-lp-muted">No credit card. Nothing to install.</p>
    </form>
  )
}
