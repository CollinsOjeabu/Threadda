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

  const card = "rounded-[18px] bg-lp-paper border border-lp-ink/10 p-7 shadow-sm"

  if (status === "success") {
    return (
      <div className={card} role="status" aria-live="polite">
        <h3 className="h-display text-[20px] font-semibold">You&apos;re on the list — we&apos;ll write once when your wave opens.</h3>
        <p className="mt-3 num text-lp-muted">No credit card. Nothing to install.</p>
      </div>
    )
  }

  const submitting = status === "submitting"

  return (
    <form className={`${card} relative`} onSubmit={onSubmit} noValidate>
      <h3 className="h-display text-[20px] font-semibold">Get in on the good stuff.</h3>
      <p className="text-[13px] text-lp-body mt-1 mb-5">Small waves. Thoughtful product. You, first.</p>

      <label htmlFor="ea-email" className="text-[13px] font-medium text-lp-ink">Work email</label>
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
        className="mt-2 w-full rounded-[10px] border border-lp-line-2 bg-white px-4 py-3 text-[14px] text-lp-ink placeholder:text-lp-muted/70 outline-none focus:border-lp-blue"
      />

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
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

      <p id="ea-platform-label" className="text-[13px] font-medium text-lp-ink mt-5">I publish on</p>
      <div role="group" aria-labelledby="ea-platform-label" className="mt-2 grid grid-cols-3 gap-2 text-[13px]">
        {PLATFORMS.map((p) => {
          const active = platform === p.value
          return (
            <button
              key={p.value}
              type="button"
              aria-pressed={active}
              onClick={() => setPlatform(p.value)}
              className={`cursor-pointer rounded-[10px] border py-2.5 transition ${
                active
                  ? "border-lp-blue bg-lp-blue/5 text-lp-blue"
                  : "border-lp-line-2 text-lp-ink hover:border-lp-ink/30"
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
        className="mt-5 w-full cursor-pointer rounded-full bg-lp-blue hover:bg-lp-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition text-white py-3.5 text-[14px] font-semibold flex items-center justify-center gap-2"
      >
        {submitting ? "Joining…" : "Request early access ↗"}
      </button>

      <p id="ea-error" role="alert" className="mt-3 text-center text-[13px] text-[#b42318] empty:hidden">
        {error}
      </p>
      <p className="mt-3 text-center num text-lp-muted">No credit card. Nothing to install.</p>
    </form>
  )
}
