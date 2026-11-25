import * as React from "react"
import { cn } from "@/lib/utils"

/** The official mark (design/app/logo-icon.svg): four thread strands fading 100/65/35/15% on a blue square. */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 52 52"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("block shrink-0", className)}
    >
      <rect width="52" height="52" rx="12" fill="#3750f1" />
      <g fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 18 C17.5 18 17.5 13 26 13 C34.5 13 34.5 18 40 18" />
        <path d="M12 24 C17.5 24 17.5 19 26 19 C34.5 19 34.5 24 40 24" strokeOpacity="0.65" />
        <path d="M12 30 C17.5 30 17.5 25 26 25 C34.5 25 34.5 30 40 30" strokeOpacity="0.35" />
        <path d="M12 36 C17.5 36 17.5 31 26 31 C34.5 31 34.5 36 40 36" strokeOpacity="0.15" />
      </g>
    </svg>
  )
}

export type LogoProps = {
  /** Height of the mark in px. The wordmark scales with it (28 → 19px type, as in the reference top bar). */
  size?: number
  /** Hide the wordmark and show the mark only. */
  markOnly?: boolean
  className?: string
}

/** Mark + wordmark "Thread" (Manrope 300) "da" (Manrope 700). */
export function Logo({ size = 28, markOnly = false, className }: LogoProps) {
  const fontSize = Math.round(size * (19 / 28) * 10) / 10
  const gap = Math.round(size * (10 / 28))
  return (
    <span
      role="img"
      aria-label="Threadda"
      className={cn("inline-flex items-center text-td-ink", className)}
      style={{ gap }}
    >
      <LogoMark size={size} />
      {!markOnly && (
        <span
          aria-hidden="true"
          className="font-td-sans font-light leading-none tracking-[-0.03em]"
          style={{ fontSize }}
        >
          Thread<b className="font-bold">da</b>
        </span>
      )}
    </span>
  )
}
